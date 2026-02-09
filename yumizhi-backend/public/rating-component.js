/**
 * 评分组件
 * 用于在技能卡片和详情页显示和提交评分
 */

class RatingComponent {
  constructor(containerId, skillId) {
    this.container = document.getElementById(containerId);
    this.skillId = skillId;
    this.userRating = 0;
    this.averageRating = 0;
    this.ratingCount = 0;
    this.init();
  }
  
  async init() {
    await this.loadRating();
    this.render();
  }
  
  async loadRating() {
    try {
      // 获取平均评分
      const stats = await YumizhiAPI.Rating.getBySkill(this.skillId);
      this.averageRating = parseFloat(stats.average);
      this.ratingCount = stats.count;
      
      // 获取用户评分（如果已登录）
      const token = YumizhiAPI.getToken();
      if (token) {
        const userData = await YumizhiAPI.Rating.getUserRating(this.skillId);
        this.userRating = userData.rating;
      }
    } catch (error) {
      console.error('Failed to load rating:', error);
    }
  }
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="rating-component">
        <div class="rating-stars">
          ${this.renderStars()}
        </div>
        <div class="rating-info">
          <span class="average">${this.averageRating.toFixed(1)}</span>
          <span class="count">(${this.ratingCount} 评价)</span>
        </div>
      </div>
    `;
    
    this.attachEvents();
  }
  
  renderStars() {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.round(this.averageRating);
      const userFilled = i <= this.userRating;
      stars += `
        <span class="star ${filled ? 'filled' : ''} ${userFilled ? 'user-rated' : ''}" 
              data-rating="${i}" 
              title="${i} 星">
          ★
        </span>
      `;
    }
    return stars;
  }
  
  attachEvents() {
    const stars = this.container.querySelectorAll('.star');
    stars.forEach(star => {
      // 悬停效果
      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        this.highlightStars(rating);
      });
      
      // 点击提交评分
      star.addEventListener('click', async () => {
        await this.submitRating(parseInt(star.dataset.rating));
      });
    });
    
    // 鼠标离开恢复原状
    this.container.querySelector('.rating-stars').addEventListener('mouseleave', () => {
      this.render();
    });
  }
  
  highlightStars(rating) {
    const stars = this.container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('hover');
      } else {
        star.classList.remove('hover');
      }
    });
  }
  
  async submitRating(rating) {
    const token = YumizhiAPI.getToken();
    if (!token) {
      alert('请先登录后再评分！');
      return;
    }
    
    try {
      const result = await YumizhiAPI.Rating.submit(this.skillId, rating);
      this.userRating = rating;
      this.averageRating = parseFloat(result.average);
      this.ratingCount = result.count;
      this.render();
      
      // 显示成功提示
      this.showToast('评分成功！');
    } catch (error) {
      alert('评分失败：' + error.message);
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

// 评分组件样式
const ratingStyles = `
<style>
.rating-component {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 20px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.filled {
  color: #ffc107;
}

.star.user-rated {
  color: #ff9800;
}

.star.hover {
  color: #ffc107;
}

.rating-info {
  font-size: 14px;
  color: #666;
}

.rating-info .average {
  font-weight: bold;
  color: #ffc107;
  margin-right: 5px;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', ratingStyles);
window.RatingComponent = RatingComponent;
