import json
import requests
from datetime import datetime
import os
import re

def fetch_github_skills():
    """
    从GitHub获取最新的OpenClaw技能列表
    """
    print("正在从GitHub获取最新的技能列表...")
    
    # GitHub API URL for openclaw skills repository
    api_url = "https://api.github.com/repos/openclaw/skills/contents/skills"
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        
        items = response.json()
        
        skills = []
        
        # 遍历每个技能目录
        for item in items:
            if item['type'] == 'dir':
                # 获取该目录下的内容
                dir_url = f"https://api.github.com/repos/openclaw/skills/contents{item['path']}"
                dir_response = requests.get(dir_url)
                
                if dir_response.status_code == 200:
                    dir_items = dir_response.json()
                    
                    # 查找SKILL.md文件
                    for dir_item in dir_items:
                        if dir_item['name'].lower() == 'skill.md':
                            # 提取技能信息
                            skill_name = item['name']
                            skill_url = dir_item['download_url']
                            
                            # 从SKILL.md内容中提取描述
                            skill_desc = extract_description_from_content(requests.get(skill_url).text)
                            
                            skill_info = {
                                'name': skill_name,
                                'url': dir_item['html_url'],
                                'description': skill_desc[:200] + "..." if len(skill_desc) > 200 else skill_desc,
                                'category': item['name'],  # 使用目录名作为类别
                                'explanation': extract_explanation_from_content(requests.get(skill_url).text)
                            }
                            
                            skills.append(skill_info)
        
        print(f"成功获取 {len(skills)} 个技能")
        return skills
        
    except Exception as e:
        print(f"获取GitHub技能时出错: {str(e)}")
        # 返回示例数据以防API调用失败
        return get_sample_skills()

def extract_description_from_content(content):
    """
    从SKILL.md内容中提取描述信息
    """
    # 尝试从内容中提取描述
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('#') or line.startswith('-'):
            # 简单提取描述信息
            if 'description' in line.lower() or 'use' in line.lower() or 'when' in line.lower():
                desc = line.replace('#', '').replace('-', '').strip()
                return desc if desc else "暂无描述"
    
    return "暂无描述"

def extract_explanation_from_content(content):
    """
    从SKILL.md内容中提取解释信息
    """
    # 简单提取描述作为解释
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('#') or line.startswith('-'):
            # 简单提取描述信息
            if 'description' in line.lower() or 'use' in line.lower() or 'when' in line.lower():
                desc = line.replace('#', '').replace('-', '').strip()
                return desc[:100] + "..." if len(desc) > 100 else desc
    
    return "此技能用于特定功能"

def get_sample_skills():
    """
    返回示例技能数据（当GitHub API不可用时）
    """
    print("使用示例技能数据...")
    return [
        {
            'name': 'artifacts-builder',
            'url': 'https://github.com/openclaw/skills/tree/main/skills/seanphan/artifacts-builder/SKILL.md',
            'description': 'Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web',
            'category': 'Web & Frontend Development',
            'explanation': '用于使用现代前端网络技术创建复杂、多组件 claude.ai HTML 工件的工具套件'
        },
        {
            'name': 'claw-shell',
            'url': 'https://github.com/openclaw/skills/tree/main/skills/imaginelogo/claw-shell/SKILL.md',
            'description': 'ALWAYS USES TMUX SESSION `claw`',
            'category': 'Web & Frontend Development',
            'explanation': '始终使用TMUX会话`claw`'
        },
        {
            'name': 'clawdbot-zoho-email',
            'url': 'https://github.com/openclaw/skills/tree/main/skills/briansmith80/clawdbot-zoho-email/SKILL.md',
            'description': 'Complete Zoho Mail integration with OAuth2, REST API (5-10x faster), HTML emails, attachments',
            'category': 'Web & Frontend Development',
            'explanation': '使用OAuth2、REST API（快5-10倍）、HTML邮件、附件的完整Zoho Mail集成'
        }
    ]

def update_html_file():
    """
    更新HTML文件中的技能数据
    """
    print("正在更新HTML文件...")
    
    # 获取最新的技能数据
    skills = fetch_github_skills()
    
    # 读取现有的HTML模板
    with open('/Users/sxh/clawd/improved_openclaw_skills.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # 替换技能数据部分
    start_marker = '// 技能数据'
    end_marker = '// 获取唯一分类'
    
    # 构建新的技能数据JS代码
    skills_js = f"// 技能数据\n        const skills = {json.dumps(skills, ensure_ascii=False, indent=12)};"
    
    # 找到替换位置
    start_pos = html_content.find(start_marker)
    end_pos = html_content.find(end_marker)
    
    if start_pos != -1 and end_pos != -1:
        # 替换技能数据
        new_html = html_content[:start_pos] + skills_js + "\n\n        " + html_content[end_pos:]
        
        # 写回文件
        with open('/Users/sxh/clawd/improved_openclaw_skills.html', 'w', encoding='utf-8') as f:
            f.write(new_html)
        
        print("HTML文件已更新")
        
        # 同步到服务器
        sync_to_server()
        
        return True
    else:
        print("找不到替换标记")
        return False

def sync_to_server():
    """
    同步更新后的文件到服务器
    """
    print("正在同步到服务器...")
    
    os.system('scp -o StrictHostKeyChecking=no /Users/sxh/clawd/improved_openclaw_skills.html root@8.210.203.136:/www/wwwroot/yumizhi.com/index.html')
    print("已同步到服务器")

def schedule_daily_updates():
    """
    设置每日自动更新
    """
    print("设置每日自动更新...")
    
    # 创建一个简单的cron作业
    cron_job = "0 9 * * * cd /Users/sxh/clawd && python3 auto_update_skills.py >> /tmp/auto_update.log 2>&1"
    
    # 检查cron作业是否存在
    result = os.popen('crontab -l').read()
    
    if 'auto_update_skills.py' not in result:
        # 添加新的cron作业
        with open('/tmp/new_cron', 'w') as f:
            if result.strip():
                f.write(result)
            f.write(cron_job + '\n')
        
        os.system('crontab /tmp/new_cron')
        os.remove('/tmp/new_cron')
        print("已设置每日上午9点自动更新")
    else:
        print("自动更新已设置")

def main():
    """
    主函数
    """
    print(f"开始自动更新任务 - {datetime.now()}")
    
    try:
        # 更新HTML文件
        success = update_html_file()
        
        if success:
            print("自动更新任务完成")
        else:
            print("自动更新任务失败")
            
        # 设置定时任务
        schedule_daily_updates()
        
    except Exception as e:
        print(f"自动更新过程中出错: {str(e)}")

if __name__ == "__main__":
    main()