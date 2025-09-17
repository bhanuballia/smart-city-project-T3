import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Admin", "Operator", "Viewer", "User"], // Expand roles if needed
      default: "User",
    },
  },
  { timestamps: true }
);

// Prevents model overwrite issues in development (when server restarts via nodemon)
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
