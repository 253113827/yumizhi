const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  skillId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 复合索引：一个用户只能给一个技能评一次分
ratingSchema.index({ skillId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
