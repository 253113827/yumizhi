const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// 中间件
app.use(helmet());
app.use(cors({
  origin: ['https://yumizhi.com', 'http://localhost:3000', 'http://localhost:5500'],
  credentials: true
}));
app.use(express.json());

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yumizhi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/comments', require('./routes/comments'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
