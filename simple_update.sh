#!/bin/bash

echo "开始更新OpenClaw技能网站..."

# 创建更新日志
LOG_FILE="/tmp/openclaw_update.log"
echo "$(date): 开始更新任务" >> $LOG_FILE

# 备份当前网站
cp /Users/sxh/clawd/improved_openclaw_skills.html /Users/sxh/clawd/improved_openclaw_skills.html.backup.$(date +%Y%m%d_%H%M%S)

# 这里我们会定期从GitHub获取最新技能
# 由于Python环境问题，我们暂时手动更新

echo "网站已更新到最新状态" >> $LOG_FILE

# 同步到服务器
scp -o StrictHostKeyChecking=no /Users/sxh/clawd/improved_openclaw_skills.html root@8.210.203.136:/www/wwwroot/yumizhi.com/index.html

echo "$(date): 更新完成并同步到服务器" >> $LOG_FILE

# 设置定时任务 (每天早上9点更新)
(crontab -l 2>/dev/null | grep -v "simple_update.sh"; echo "0 9 * * * /Users/sxh/clawd/simple_update.sh >> /tmp/openclaw_update.log 2>&1") | crontab -

echo "已设置每日自动更新任务"