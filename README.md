# 摄影与舞台社网站

这是杭州第九中学树范学校摄影与舞台社的官方网站，包含前端和后端两部分。

## 项目结构

```
├── src/                # 前端代码
│   ├── components/     # React组件
│   ├── contexts/       # React上下文
│   ├── hooks/          # 自定义Hooks
│   ├── lib/            # 工具函数
│   ├── pages/          # 页面组件
│   ├── App.tsx         # 应用入口组件
│   └── main.tsx        # 主入口文件
├── server/             # 后端代码
│   ├── config/         # 配置文件
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # API路由
│   ├── index.js        # 服务器入口
│   └── package.json    # 后端依赖
├── .env.example        # 环境变量示例
└── package.json        # 前端依赖
```

## 部署指南

### 前端部署

1. 安装依赖
```bash
npm install
```

2. 构建前端应用
```bash
npm run build
```

3. 部署构建产物（dist目录）到静态文件服务器或CDN

### 后端部署

1. 安装MongoDB数据库
   - 在腾讯云轻量服务器上安装MongoDB
   - 创建数据库 `photography-club`

2. 配置环境变量
   - 复制 `.env.example` 为 `.env`
   - 修改 `.env` 文件中的配置，特别是数据库连接字符串和JWT密钥

3. 安装后端依赖
```bash
cd server
npm install
```

4. 启动后端服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

### 使用PM2进行进程管理（推荐）

1. 安装PM2
```bash
npm install -g pm2
```

2. 使用PM2启动后端服务
```bash
cd server
pm2 start index.js --name photography-club-api
```

3. 设置PM2开机自启
```bash
pm2 startup
pm2 save
```

## 管理员账号

系统默认管理员账号：
- 手机号：13800138000
- 密码：admin123

首次登录后请修改密码。

## 功能说明

1. **前端功能**
   - 摄影知识图谱
   - 作品投稿
   - 优秀作品展示
   - 投票系统
   - 留言板
   - 用户认证

2. **后端功能**
   - RESTful API
   - 用户认证和授权
   - 数据存储和管理
   - 图片处理