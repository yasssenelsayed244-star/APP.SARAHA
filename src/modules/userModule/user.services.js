import { successHandler } from "../../utils/successHandler.js";
import { NotFoundException } from "../../utils/exceptions.js";
import {
  deletedByPrefix,
  deleteFolder,
  destroySingleFile,
  uploadMultiFiles,
  uploadSingleFile,
} from "../../utils/multer/cloud.services.js";
import { Roles, userModule } from "../../DB/models/user.models.js";

export const updateBasicInfo = async (req, res, next) => {
  const { firstName, lastName, age, phone } = req.body;
  const user = req.user;

  user.age = age || user.age;
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;

  await user.save();
  return successHandler({ res });
};

export const shareProfile = async (req, res, next) => {
  const user = req.user;
  const link = `${req.protocol}://${req.host}/users/${user._id}`;
  return successHandler({ res, data: link });
};

export const getProfile = async (req, res, next) => {
  const id = req.params.id;
  const user = await userModule
    .findOne({
      _id: id,
      isDeleted: false,
    })
    .select("firstName lastName email phone profileImage");

  if (!user) {
    throw new NotFoundException("user");
  }

  return successHandler({ res, data: user });
};

export const softDelete = async (req, res) => {
  const { id } = req.params;
  const user = await userModule.findOne({
    isDeleted: false,
    _id: id,
  });

  if (!user) {
    throw new NotFoundException("user");
  }
  if (user.role === Roles.admin) {
    throw new Error("Admin cannot be deleted");
  }

  user.isDeleted = true;
  user.deletedBy = req.user._id;
  await user.save();

  return successHandler({ res });
};

export const restoreAccount = async (req, res) => {
  const { id } = req.params;
  const user = await userModule.findById(id);

  if (!user) {
    throw new NotFoundException("user");
  }
  if (!user.isDeleted) {
    throw new Error("User not deleted", { cause: 400 });
  }
  if (user.deletedBy.toString() !== req.user._id.toString()) {
    throw new Error("You can't restore this account", { cause: 401 });
  }

  user.deletedBy = undefined;
  user.isDeleted = false;
  await user.save();

  return successHandler({ res });
};

export const deleteUser = async (req, res) => {
  const user = req.user;

  if (user.profileImage || user.coverImages) {
    await deletedByPrefix({ prefix: `users/${user._id}` });
    await deleteFolder({ folder: `users/${user._id}` });
  }

  await user.deleteOne();
  return successHandler({ res });
};

export const profileImage = async (req, res) => {
  const user = req.user;

  if (user.profileImage?.public_id) {
    await destroySingleFile({ public_id: user.profileImage.public_id });
  }

  const { secure_url, public_id } = await uploadSingleFile({
    path: req.file.path,
    dest: `users/${user._id}/profile_images`,
  });

  user.profileImage = {
    secure_url,
    public_id,
  };

  await user.save();
  return successHandler({ res });
};

export const covarImages = async (req, res) => {
  const user = req.user;
  const files = req.files;
  const paths = files.map((file) => file.path);

  const coverImages = await uploadMultiFiles({
    paths,
    dest: `users/${user._id}/coverImages`,
  });

  if (user.coverImages) {
    user.coverImages.push(...coverImages);
  } else {
    user.coverImages = coverImages;
  }

  await user.save();
  successHandler({ res, data: user });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await userModule.findById(id);
  return successHandler({ res, data: user });
};
