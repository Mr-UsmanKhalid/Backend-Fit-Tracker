const express = require("express");

const {
  getNotifications,
  getNotification,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);

router.post("/", createNotification);

router.put("/read-all", markAllNotificationsAsRead);

router.get("/:id", getNotification);

router.put("/:id/read", markNotificationAsRead);

router.delete("/:id", deleteNotification);

module.exports = router;