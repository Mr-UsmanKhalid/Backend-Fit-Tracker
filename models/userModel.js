const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  { 
    username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
  }, 
  
  name: { type: 
    String, required: 
    true, trim: true, 
  }, 
  
 email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
  }, 
  password: { 
      type: String, 
      required: true, 
    }, 
  profilePicture: { 
    type: String, 
    default: "", 
  },
   // ======================== // PASSWORD RESET // ======================== 
   resetPasswordToken: { 
    type: String, 
    default: null, 
  }, 
  resetPasswordExpire: { 
    type: Date, 
    default: null, 
  }, 

  profilePicture: { type: String, default: "" },
}, 
{ timestamps: true, }
);

const User = mongoose.model("User", userSchema);

module.exports = User;