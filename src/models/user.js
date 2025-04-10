import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, require: true },
    password: { type: String, required: true },
    fullname: { type: String, require: true },
    username: { type: String, require: true },
    role: { type: Number, require: true },
    birthday: { type: Date },
    sex: { type: Boolean },
    level: { type: Number },
    demand: { type: String },
    avatar: { type: String },
    verified: { type: Boolean, default: false },
  },
  {
    collection: "user",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("user", UserSchema);

export default User;
