const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  deleteAccount,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ========================
// PUBLIC ROUTES
// ========================

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ========================
// PROTECTED ROUTES
// ========================

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);


router.get("/me", protect, getMe);

// ========================
// EXPORTS
// ========================

module.exports = router;