import cloudinary from "./cloudConfig.js";

export const uploadSingleFile = async ({ path, dest = "" }) => {
  const { secure_url, public_id } = await cloudinary.uploader.upload(path, {
    folder: `${process.env.cloudFolder}/${dest}`,
  });
  return { secure_url, public_id };
};

export const destroySingleFile = async ({ public_id }) => {
  await cloudinary.uploader.destroy(public_id);
};

export const uploadMultiFiles = async ({ paths = [], dest = "" }) => {
  if (paths.length === 0) {
    throw new Error("No files exist");
  }

  const images = [];
  for (const path of paths) {
    const { secure_url, public_id } = await uploadSingleFile({
      path: path,
      dest: `${dest}`,
    });
    images.push({ secure_url, public_id });
  }
  return images;
};

export const deleteFolder = async ({ folder = "" }) => {
  try {
    await cloudinary.api.delete_folder(`${process.env.cloudFolder}/${folder}`);
  } catch (error) {
    console.log({ error });
  }
};

export const deletedByPrefix = async ({ prefix = "" }) => {
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.cloudFolder}/${prefix}`
  );
};
