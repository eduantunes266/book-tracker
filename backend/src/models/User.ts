import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // MongoDB creates a unique index, so no two users share an email
      lowercase: true,
      trim: true,
    },
    // We never store the plain password, only the bcrypt hash
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const User = mongoose.model("User", userSchema);

export default User;
