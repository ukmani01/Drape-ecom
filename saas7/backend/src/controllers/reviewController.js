import Review from '../models/Review.js';
import ActivityLog from '../models/ActivityLog.js';

export const getReviews = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { page = 1, limit = 20 } = req.query;
    const reviews = await Review.find({ storeId })
      .populate('productId', 'title')
      .populate('customerId', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Review.countDocuments({ storeId });
    res.status(200).json({
      success: true,
      data: { docs: reviews, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const review = await Review.findOne({ _id: req.params.id, storeId });
    if (!review) throw new Error('Review not found');
    review.status = 'approved';
    await review.save();
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'REVIEW_APPROVED',
      details: { reviewId: review._id },
    });
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const rejectReview = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const review = await Review.findOne({ _id: req.params.id, storeId });
    if (!review) throw new Error('Review not found');
    review.status = 'rejected';
    await review.save();
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'REVIEW_REJECTED',
      details: { reviewId: review._id },
    });
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};