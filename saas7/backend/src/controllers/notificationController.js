import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

export const getNotifications = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ storeId, userId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Notification.countDocuments({ storeId, userId });
    res.status(200).json({
      success: true,
      data: { docs: notifications, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const userId = req.user.id;
    const notification = await Notification.findOne({ _id: req.params.id, storeId, userId });
    if (!notification) throw new Error('Notification not found');
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const userId = req.user.id;
    await Notification.updateMany({ storeId, userId, isRead: false }, { isRead: true, readAt: new Date() });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const userId = req.user.id;
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, storeId, userId });
    if (!notification) throw new Error('Notification not found');
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};