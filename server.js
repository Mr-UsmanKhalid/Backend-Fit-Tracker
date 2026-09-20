const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const progressRoutes = require("./routes/progressRoutes"); 
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const searchRoutes = require("./routes/searchRoutes");
const userRoutes = require("./routes/userRoutes");
  

const connection = require("./config/db");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

connection();

app.get("/", (req, res) => {
  res.send("Fitness Tracker API is running");
});

app.use("/api/auth", authRoutes);
// WORKOUTS
app.use("/api/workouts", workoutRoutes);
// Nutrition
app.use("/api/nutrition", nutritionRoutes);
// Progress
app.use("/api/Progress", progressRoutes); 
// Nofications
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;

const cloudinary = require("./utils/cloudinary");

cloudinary.api.ping()
  .then((result) => {
    console.log("Cloudinary connection:", result);
  })
  .catch((error) => {
    console.error("Cloudinary connection failed:", error);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})