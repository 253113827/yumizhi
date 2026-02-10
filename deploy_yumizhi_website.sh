#!/bin/bash

# yumizhi 网站部署脚本
SERVER_IP="8.210.203.136"
SERVER_USER="root"
SERVER_PASSWORD="qQ121676463"
LOCAL_PROJECT_PATH="/Users/sxh/clawd"
REMOTE_WEB_PATH="/www/wwwroot/yumizhi.com"

echo "开始部署 yumizhi (玉米知) 网站..."

# 1. 确保远程目录存在
echo "确保远程目录存在..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_WEB_PATH"

# 2. 部署主页文件
echo "部署主页文件..."
scp index.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/

# 3. 部署个人中心页面
echo "部署个人中心页面..."
scp user-center.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/

# 4. 部署其他页面文件
echo "部署其他页面文件..."
scp about.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/
scp help.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/
scp skills.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/

# 5. 部署技能集合页面
echo "部署技能集合页面..."
scp openclaw_skills.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/
scp openclaw_skills_cn.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/
scp openclaw_skills_full_cn.html $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/

# 6. 部署SEO相关文件
echo "部署SEO相关文件..."
scp robots.txt $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/
scp sitemap.xml $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/
scp manifest.json $SERVER_USER@$SERVER_IP:$REMOTE_WEB_PATH/

# 7. 设置正确的文件权限
echo "设置文件权限..."
ssh $SERVER_USER@$SERVER_IP "chmod -R 755 $REMOTE_WEB_PATH"
ssh $SERVER_USER@$SERVER_IP "chown -R www:www $REMOTE_WEB_PATH"

echo "部署完成！网站可通过以下地址访问："
echo "主页: http://yumizhi.com/"
echo "个人中心: http://yumizhi.com/user-center.html"
echo "技能集合: http://yumizhi.com/openclaw_skills.html"
echo "关于页面: http://yumizhi.com/about.html"
echo "帮助页面: http://yumizhi.com/help.html"
echo "技能分类: http://yumizhi.com/skills.html"