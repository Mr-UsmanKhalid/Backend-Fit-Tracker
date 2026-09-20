const express = require("express");

const protect = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/Uploadmiddleware");
const {
  uploadProfilePicture,
} = require("../controllers/Profilepicturecontroller");

const router = express.Router();

// All user routes require login
router.use(protect);

// Upload / replace profile picture (multipart/form-data, field: "profilePicture")
router.post("/profile-picture", uploadAvatar, uploadProfilePicture);

module.exports = router;