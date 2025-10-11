import multer, { diskStorage } from "multer";

export const fileTypes = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  video: ["video/mp4"],
};

export const uploadToCloud = (type = fileTypes.image) => {
  const storage = diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (!type.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    return cb(null, true);
  };

  return multer({ storage, fileFilter });
};
