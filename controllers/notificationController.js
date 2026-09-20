const Notification = require("../models/Notification");

// GET ALL NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const { isRead, type, limit = 50 } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};


// GET SINGLE NOTIFICATION
const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification fetched successfully",
      notification,
    });
  } catch (error) {
    console.error("GET NOTIFICATION ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};


// CREATE NOTIFICATION
const createNotification = async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      link,
      metadata,
    } = req.body;

    if (!type) {
      return res.status(400).json({
        message: "Notification type is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Notification title is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Notification message is required",
      });
    }

    const notification = await Notification.create({
      user: req.user._id,
      type,
      title: title.trim(),
      message: message.trim(),
      link: link || "",
      metadata: metadata || {},
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};


// MARK ONE AS READ
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};


// MARK ALL AS READ
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

    res.status(500).json({
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};


// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    await Notification.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      message: "Notification deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};


module.exports = {
  getNotifications,
  getNotification,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};