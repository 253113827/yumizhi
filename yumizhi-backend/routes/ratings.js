const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const jwt = require('jsonwebtoken');

// JWT 验证中间件
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yumizhi-secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 提交评分
router.post('/', auth, async (req, res) => {
  try {
    const { skillId, rating } = req.body;
    
    if (!skillId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    
    // 更新或创建评分
    const existingRating = await Rating.findOne({ skillId, userId: req.userId });
    
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await new Rating({ skillId, userId: req.userId, rating }).save();
    }
    
    // 计算平均分
    const stats = await Rating.aggregate([
      { $match: { skillId } },
      { 
        $group: { 
          _id: '$skillId',
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      average: stats[0]?.average?.toFixed(1) || rating,
      count: stats[0]?.count || 1,
      userRating: rating
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取技能评分
router.get('/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const stats = await Rating.aggregate([
      { $match: { skillId } },
      { 
        $group: { 
          _id: '$skillId',
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      average: stats[0]?.average?.toFixed(1) || 0,
      count: stats[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户评分
router.get('/:skillId/user', auth, async (req, res) => {
  try {
    const { skillId } = req.params;
    const rating = await Rating.findOne({ skillId, userId: req.userId });
    res.json({ rating: rating?.rating || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
