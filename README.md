# 敲木鱼 - 微信小程序

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
编辑 `.env` 文件，将 `DB_URL` 替换为你的 Supabase 数据库连接串。

### 3. 初始化数据库（创建表和索引）
```bash
npm run db:init
```

### 4. 启动后端服务
```bash
npm start
```

### 5. 验证服务
```bash
curl http://localhost:3000/api/health
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| POST | /api/user/login | 用户登录/注册 |
| POST | /api/merit/sync | 功德增量同步 |
| GET | /api/rank | 排行榜（前50） |
| GET | /api/skins | 皮肤列表 |
| POST | /api/user/skin | 切换皮肤 |

## 数据库表

- `users` - 用户表（openid唯一索引 + merit降序索引）
- `merit_logs` - 功德同步日志（openid+时间复合索引）
- `skins` - 皮肤配置表（预置3款皮肤）

## 小程序端

`miniprogram/` 目录用微信开发者工具打开即可预览。
