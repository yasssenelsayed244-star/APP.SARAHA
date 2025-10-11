import { model, Schema, Types } from "mongoose";
import { decryption, encryption } from "../../utils/crypto.js";
import { compare, hash } from "../../utils/bycrypt.js";

export const Gendar = {
  male: "male",
  female: "female",
};
Object.freeze(Gendar);

export const Roles = {
  admin: "admin",
  user: "user",
};
Object.freeze(Roles);

export const providers = {
  google: "google",
  system: "system",
};
Object.freeze(providers);

const otpSchema = new Schema(
  {
    otp: String,
    expiredAt: Date,
  },
  {
    _id: false,
  }
);

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providers.system;
      },
      set(value) {
        return hash(value);
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 50,
    },
    gendar: {
      type: String,
      enum: Object.values(Gendar),
      default: Gendar.male,
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.user,
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === providers.system;
      },
      set(value) {
        return encryption(value);
      },
      get(value) {
        return value ? decryption(value) : value;
      },
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    emailOtp: otpSchema,
    newEmailOtp: otpSchema,
    oldEmailOtp: otpSchema,
    passwordOtp: otpSchema,
    newEmail: String,
    changedCradentialAt: Date,
    provider: {
      type: String,
      enum: Object.values(providers),
      default: providers.system,
    },
    socialId: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    profileImage: {
      secure_url: String,
      public_id: String,
    },
    coverImages: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
    virtuals: {
      fullName: {
        get() {
          return this.firstName + " " + this.lastName;
        },
      },
    },
    methods: {
      checkPassword(password) {
        return compare(password, this.password);
      },
    },
  }
);

export const userModule = model("user", userSchema);
