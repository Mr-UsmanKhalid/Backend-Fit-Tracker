const express = require("express");

const protect = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/Uploadmiddleware");
const {
  uploadProfilePicture,
} = require("../controllers/Profilepicturecontroller");
const {
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();

// All user routes require login
router.use(protect);

// Edit name / username / email (the frontend calls PUT /api/users/profile)
router.put("/profile", updateProfile);

// Change password for the logged-in user (PUT /api/users/change-password)
router.put("/change-password", changePassword);

// Upload / replace profile picture (multipart/form-data, field: "profilePicture")
router.post("/profile-picture", uploadAvatar, uploadProfilePicture);

module.exports = router;