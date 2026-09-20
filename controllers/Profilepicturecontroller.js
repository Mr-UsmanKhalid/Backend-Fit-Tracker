const cloudinary = require("../utils/cloudinary");
const User = require("../models/userModel");

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("========== CLOUDINARY ERROR ==========");
          console.error("Message:", error.message);
          console.error("HTTP Code:", error.http_code);
          console.error("Name:", error.name);

          // Print complete error for debugging
          console.error(
            "Full error:",
            JSON.stringify(error, null, 2)
          );

          console.error("======================================");

          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });


// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    // --------------------------------
    // 1. Check file
    // --------------------------------
    if (!req.file) {
      return res.status(400).json({
        message: "Please choose an image to upload",
      });
    }

    console.log("========== FILE RECEIVED ==========");
    console.log({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer,
    });
    console.log("===================================");


    // --------------------------------
    // 2. Validate image
    // --------------------------------
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }


    // --------------------------------
    // 3. Check Cloudinary configuration
    // --------------------------------
    console.log("========== CLOUDINARY CONFIG ==========");

    console.log({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "MISSING",
      api_key: process.env.CLOUDINARY_API_KEY
        ? "SET"
        : "MISSING",
      api_secret: process.env.CLOUDINARY_API_SECRET
        ? "SET"
        : "MISSING",
    });

    console.log("=======================================");


    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        message: "Cloudinary configuration is missing",
      });
    }


    // --------------------------------
    // 4. Upload to Cloudinary
    // --------------------------------
    console.log("Uploading image to Cloudinary...");

    const result = await uploadToCloudinary(
      req.file.buffer,
      {
        folder: "fittrack/avatars",
        resource_type: "image",
      }
    );


    // --------------------------------
    // 5. Check Cloudinary response
    // --------------------------------
    if (!result || !result.secure_url) {
      console.error(
        "Cloudinary returned an invalid response:",
        result
      );

      return res.status(500).json({
        message: "Cloudinary did not return an image URL",
      });
    }

    console.log("========== CLOUDINARY SUCCESS ==========");
    console.log({
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height,
    });
    console.log("========================================");


    // --------------------------------
    // 6. Update user in MongoDB
    // --------------------------------
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePicture: result.secure_url,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");


    // --------------------------------
    // 7. User not found
    // --------------------------------
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    // --------------------------------
    // 8. Success
    // --------------------------------
    console.log(
      "Profile picture saved for user:",
      req.user._id
    );

    return res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });

  } catch (error) {
    // --------------------------------
    // Cloudinary error
    // --------------------------------
    console.error("========== UPLOAD ERROR ==========");

    console.error({
      message: error.message,
      http_code: error.http_code,
      name: error.name,
    });

    console.error(
      "Full error:",
      JSON.stringify(error, null, 2)
    );

    console.error("==================================");


    return res.status(500).json({
      message: "Failed to upload profile picture",
      error: error.message,
    });
  }
};


module.exports = {
  uploadProfilePicture,
};