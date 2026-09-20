const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");

const sendEmail = require("../utils/sendEmail");

// ========================
// Generate JWT
// ========================
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ========================
// Auth Me
// ========================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}; 


// ========================
// REGISTER
// ========================
const registerUser = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      password,
      profilePicture,
    } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username: username.toLowerCase(), 
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePicture: profilePicture || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// LOGIN
// ========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// FORGOT PASSWORD
// ========================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    console.log("PASSWORD RESET LINK:", resetUrl);

    sendEmail(
      normalizedEmail,
      "Reset Your Fitness Tracking Password",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Reset your password</h2>

          <p>
            You requested a password reset for your Fitness Tracking account.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #c8ff4d;
                color: #000;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This reset link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you didn't request a password reset, you can safely ignore this email.
          </p>

          <p>— Fitness Tracking</p>
        </div>
      `
    )
      .then(() => {
        console.log(
          "Password reset email sent to:",
          normalizedEmail
        );
      })
      .catch((error) => {
        console.error(
          "Password reset email failed:",
          error
        );
      });

    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// ========================
// RESET PASSWORD
// ========================
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Hash token before searching database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// GET PROFILE
// ========================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// UPDATE PROFILE
// ========================
const updateProfile = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      profilePicture,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username) {
      user.username = username;
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// DELETE ACCOUNT
// ========================
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================
// EXPORTS
// ========================
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  deleteAccount,
  getMe,
};