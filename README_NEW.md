# yumizhi (玉米知) - OpenClaw 技能社区平台

一个自动化维护、持续升级的 OpenClaw 技能集合网站。

## 🌐 在线访问

- **主站**: https://yumizhi.com
- **技能列表**: https://yumizhi.com/skills.html
- **个人中心**: https://yumizhi.com/user-center.html
- **英文版**: https://yumizhi.com/english.html

## 📁 项目结构

```
├── index.html              # 首页（导航 + 热门技能）
├── skills.html             # 技能分类页面
├── user-center.html        # 个人中心
├── about.html              # 关于我们
├── help.html               # 帮助中心
├── english.html            # 英文版技能列表
├── openclaw_skills.html    # 完整技能列表（英文）
├── openclaw_skills_cn.html # 完整技能列表（中文）
├── improved_openclaw_skills.html # 改进版技能列表
├── auto_update_skills.py   # 自动更新脚本
└── deploy-package/         # 部署包
```

## ✨ 功能特性

- 🔍 **智能搜索**: 支持关键词搜索技能
- 🏷️ **分类浏览**: 30+ 技能分类
- ❤️ **收藏功能**: 本地收藏喜欢的技能
- ⭐ **评分系统**: 查看技能评分
- 🌐 **中英双语**: 支持中英文切换
- 📱 **响应式设计**: 适配移动端
- 🔄 **自动更新**: 每日自动同步最新技能数据

## 🚀 技术栈

- **前端**: HTML5, CSS3, JavaScript (原生)
- **后端**: Python (技能数据更新)
- **部署**: Linux + Nginx
- **自动化**: OpenClaw + Cron

## 📊 数据统计

- 英文版技能: 1,662 个
- 中文版技能: 1,617 个
- 分类数量: 30+

## 🔄 自动更新

每日 9:00 AM 自动运行 `simple_update.sh` 脚本：
1. 获取最新技能数据
2. 更新网站文件
3. 同步到服务器
4. 提交到 GitHub

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
