const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// 发表评论
router.post('/', auth, async (req, res) => {
  try {
    const { skillId, content } = req.body;
    
    if (!skillId || !content?.trim()) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    
    const user = await User.findById(req.userId);
    
    const comment = new Comment({
      skillId,
      userId: req.userId,
      username: user.username,
      avatar: user.avatar,
      content: content.trim()
    });
    
    await comment.save();
    
    res.status(201).json({
      success: true,
      comment: {
        id: comment._id,
        username: comment.username,
        avatar: comment.avatar,
        content: comment.content,
        likes: 0,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取评论列表
router.get('/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const comments = await Comment.find({ skillId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Comment.countDocuments({ skillId });
    
    res.json({
      comments: comments.map(c => ({
        id: c._id,
        username: c.username,
        avatar: c.avatar,
        content: c.content,
        likes: c.likes.length,
        replies: c.replies,
        createdAt: c.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 点赞评论
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const likeIndex = comment.likes.indexOf(req.userId);
    
    if (likeIndex > -1) {
      // 取消点赞
      comment.likes.splice(likeIndex, 1);
    } else {
      // 添加点赞
      comment.likes.push(req.userId);
    }
    
    await comment.save();
    
    res.json({
      success: true,
      likes: comment.likes.length,
      liked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 回复评论
router.post('/:commentId/reply', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const user = await User.findById(req.userId);
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    comment.replies.push({
      userId: req.userId,
      username: user.username,
      avatar: user.avatar,
      content: content.trim()
    });
    
    await comment.save();
    
    res.status(201).json({
      success: true,
      reply: comment.replies[comment.replies.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
