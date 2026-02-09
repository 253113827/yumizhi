/**
 * 评论组件
 * 用于显示和提交评论
 */

class CommentComponent {
  constructor(containerId, skillId) {
    this.container = document.getElementById(containerId);
    this.skillId = skillId;
    this.comments = [];
    this.page = 1;
    this.limit = 10;
    this.hasMore = true;
    this.init();
  }
  
  async init() {
    await this.loadComments();
    this.render();
  }
  
  async loadComments() {
    try {
      const data = await YumizhiAPI.Comment.getBySkill(this.skillId, this.page, this.limit);
      this.comments = data.comments;
      this.hasMore = this.page < data.pagination.pages;
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="comment-section">
        <h3 class="comment-title">💬 用户评论 (${this.comments.length})</h3>
        
        <!-- 评论输入框 -->
        <div class="comment-input-area">
          <textarea id="comment-input-${this.skillId}" 
                    placeholder="分享你对这个技能的看法..." 
                    maxlength="1000"></textarea>
          <button onclick="commentComponents['${this.skillId}'].submitComment()">
            发表评论
          </button>
        </div>
        
        <!-- 评论列表 -->
        <div class="comment-list">
          ${this.comments.length === 0 ? 
            '<div class="no-comments">暂无评论，来发表第一条评论吧！</div>' : 
            this.comments.map(c => this.renderComment(c)).join('')
          }
        </div>
        
        ${this.hasMore ? `
          <button class="load-more" onclick="commentComponents['${this.skillId}'].loadMore()">
            加载更多
          </button>
        ` : ''}
      </div>
    `;
  }
  
  renderComment(comment) {
    const date = new Date(comment.createdAt).toLocaleDateString('zh-CN');
    return `
      <div class="comment-item" data-id="${comment.id}">
        <div class="comment-header">
          <img src="${comment.avatar || 'default-avatar.png'}" alt="${comment.username}" class="avatar">
          <span class="username">${comment.username}</span>
          <span class="date">${date}</span>
        </div>
        <div class="comment-content">${this.escapeHtml(comment.content)}</div>
        <div class="comment-actions">
          <button onclick="commentComponents['${this.skillId}'].toggleLike('${comment.id}')" 
                  class="like-btn ${comment.liked ? 'liked' : ''}">
            ❤️ ${comment.likes}
          </button>
          <button onclick="commentComponents['${this.skillId}'].showReplyForm('${comment.id}')">
            回复
          </button>
        </div>
        
        <!-- 回复列表 -->
        ${comment.replies?.length ? `
          <div class="replies">
            ${comment.replies.map(r => this.renderReply(r)).join('')}
          </div>
        ` : ''}
        
        <!-- 回复输入框 -->
        <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
          <textarea placeholder="回复 ${comment.username}..." maxlength="500"></textarea>
          <button onclick="commentComponents['${this.skillId}'].submitReply('${comment.id}')">发送</button>
        </div>
      </div>
    `;
  }
  
  renderReply(reply) {
    const date = new Date(reply.createdAt).toLocaleDateString('zh-CN');
    return `
      <div class="reply-item">
        <img src="${reply.avatar || 'default-avatar.png'}" alt="${reply.username}" class="avatar small">
        <div class="reply-content">
          <span class="username">${reply.username}</span>
          <span class="text">${this.escapeHtml(reply.content)}</span>
          <span class="date">${date}</span>
        </div>
      </div>
    `;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  async submitComment() {
    const token = YumizhiAPI.getToken();
    if (!token) {
      alert('请先登录后再评论！');
      return;
    }
    
    const input = document.getElementById(`comment-input-${this.skillId}`);
    const content = input.value.trim();
    
    if (!content) {
      alert('请输入评论内容');
      return;
    }
    
    try {
      await YumizhiAPI.Comment.create(this.skillId, content);
      input.value = '';
      this.page = 1;
      await this.loadComments();
      this.render();
      this.showToast('评论发表成功！');
    } catch (error) {
      alert('评论失败：' + error.message);
    }
  }
  
  async toggleLike(commentId) {
    const token = YumizhiAPI.getToken();
    if (!token) {
      alert('请先登录后再点赞！');
      return;
    }
    
    try {
      const result = await YumizhiAPI.Comment.like(commentId);
      
      // 更新 UI
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) {
        comment.likes = result.likes;
        comment.liked = result.liked;
        this.render();
      }
    } catch (error) {
      console.error('Like failed:', error);
    }
  }
  
  showReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
  
  async submitReply(commentId) {
    const token = YumizhiAPI.getToken();
    if (!token) {
      alert('请先登录后再回复！');
      return;
    }
    
    const form = document.getElementById(`reply-form-${commentId}`);
    const textarea = form.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) {
      alert('请输入回复内容');
      return;
    }
    
    try {
      await YumizhiAPI.Comment.reply(commentId, content);
      await this.loadComments();
      this.render();
      this.showToast('回复成功！');
    } catch (error) {
      alert('回复失败：' + error.message);
    }
  }
  
  async loadMore() {
    this.page++;
    try {
      const data = await YumizhiAPI.Comment.getBySkill(this.skillId, this.page, this.limit);
      this.comments = [...this.comments, ...data.comments];
      this.hasMore = this.page < data.pagination.pages;
      this.render();
    } catch (error) {
      console.error('Load more failed:', error);
    }
  }
  
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}

// 评论组件样式
const commentStyles = `
<style>
.comment-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.comment-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.comment-input-area {
  margin-bottom: 20px;
}

.comment-input-area textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  font-size: 14px;
}

.comment-input-area button {
  margin-top: 10px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.comment-input-area button:hover {
  opacity: 0.9;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-comments {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-style: italic;
}

.comment-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-header .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-header .username {
  font-weight: bold;
  color: #333;
}

.comment-header .date {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.comment-content {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.comment-actions button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.comment-actions button:hover {
  background: #f0f0f0;
}

.comment-actions .like-btn.liked {
  color: #e91e63;
}

.replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 3px solid #e0e0e0;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.reply-item .avatar.small {
  width: 28px;
  height: 28px;
}

.reply-content {
  flex: 1;
  font-size: 14px;
}

.reply-content .username {
  font-weight: bold;
  color: #667eea;
  margin-right: 8px;
}

.reply-content .text {
  color: #555;
}

.reply-content .date {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}

.reply-form {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

.reply-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
  margin-bottom: 8px;
}

.reply-form button {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.load-more {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 15px;
  color: #667eea;
  font-weight: bold;
}

.load-more:hover {
  background: #f8f8f8;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', commentStyles);

// 全局评论组件管理器
window.commentComponents = {};
window.CommentComponent = CommentComponent;
