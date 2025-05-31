import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: Number, required: true },
    birthday: { type: Date },
    sex: { type: Boolean },
    level: { type: Number },
    demand: { type: String },
    avatar: { type: String },
    refreshToken: { type: String },
    verified: { type: Boolean, default: false },
  },
  {
    collection: "user",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "1h",
    }
  );
  return token;
};

const User = mongoose.model("user", UserSchema);

export default User;
