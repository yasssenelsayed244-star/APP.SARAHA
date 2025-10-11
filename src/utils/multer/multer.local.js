import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs/promises";

export const fileTypes = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  video: ["video/mp4"],
};

export const uploadFile = (folderName = "general", type = fileTypes.image) => {
  const storage = diskStorage({
    destination: async (req, file, cb) => {
      const folder = `uploads/${folderName}/${req.user.firstName}`;
      await fs.access(folder).catch(async () => {
        await fs.mkdir(folder, { recursive: true });
      });
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, `${nanoid(10)}_${file.originalname}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!type.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    return cb(null, true);
  };

  return multer({ storage, fileFilter });
};
