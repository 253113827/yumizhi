/**
 * yumizhi API 客户端
 * 用于与后端服务通信
 */

const API_BASE_URL = 'https://api.yumizhi.com' || 'http://localhost:3001';

// 获取 token
function getToken() {
  return localStorage.getItem('yumizhi_token');
}

// 设置 token
function setToken(token) {
  localStorage.setItem('yumizhi_token', token);
}

// 清除 token
function clearToken() {
  localStorage.removeItem('yumizhi_token');
}

// API 请求封装
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// 用户认证 API
const AuthAPI = {
  register: (username, email, password) => 
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    }),
  
  login: (email, password) => 
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  getMe: () => apiRequest('/api/auth/me'),
  
  updateProfile: (data) => 
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  syncFavorites: (favorites) => 
    apiRequest('/api/auth/favorites/sync', {
      method: 'POST',
      body: JSON.stringify({ favorites })
    })
};

// 评分 API
const RatingAPI = {
  submit: (skillId, rating) => 
    apiRequest('/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ skillId, rating })
    }),
  
  getBySkill: (skillId) => 
    apiRequest(`/api/ratings/${skillId}`),
  
  getUserRating: (skillId) => 
    apiRequest(`/api/ratings/${skillId}/user`)
};

// 评论 API
const CommentAPI = {
  create: (skillId, content) => 
    apiRequest('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ skillId, content })
    }),
  
  getBySkill: (skillId, page = 1, limit = 10) => 
    apiRequest(`/api/comments/${skillId}?page=${page}&limit=${limit}`),
  
  like: (commentId) => 
    apiRequest(`/api/comments/${commentId}/like`, {
      method: 'POST'
    }),
  
  reply: (commentId, content) => 
    apiRequest(`/api/comments/${commentId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
};

// 导出
window.YumizhiAPI = {
  getToken,
  setToken,
  clearToken,
  Auth: AuthAPI,
  Rating: RatingAPI,
  Comment: CommentAPI
};
