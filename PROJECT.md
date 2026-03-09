# 可转债回测系统 - 项目备忘

## 🚀 快速恢复指南

如果喵喵失忆了，告诉她：
1. "你的名字是喵喵，我叫大王"
2. "项目代码在 ~/projects/bond-backtest/"
3. "读取 PROJECT.md 文件"

---

## 📁 项目结构

```
~/projects/bond-backtest/
├── frontend/          # React + TypeScript + Vite
│   ├── src/App.tsx    # 主页面
│   └── package.json   # 依赖
└── backend/           # FastAPI + Python
    ├── main.py        # 入口
    ├── models/        # 数据模型
    ├── services/      # 业务逻辑
    └── routers/       # API路由
```

---

## ⚡ 快速启动

### 后端
```bash
cd ~/projects/bond-backtest/backend
source venv/bin/activate
uvicorn main:app --reload
# API地址: http://localhost:8000
```

### 前端
```bash
cd ~/projects/bond-backtest/frontend
npm run dev
# 页面地址: http://localhost:5174
```

---

## ✅ 当前进度 (MVP已完成)

- [x] 后端API：提供可转债数据
- [x] 前端页面：展示数据表格
- [x] 数据连接：前后端通信正常
- [ ] 筛选器UI（待开发）
- [ ] 回测功能（待开发）

---

## 📊 数据源

- 本地JSON：`backend/data/bonds.json`
- 当前10只可转债样本数据

---

## 🎯 下一步计划

1. 添加筛选器（价格范围、溢价率滑块）
2. 接入实时数据源
3. 开发回测核心功能
4. 数据可视化图表

---

*最后更新：2026-03-09*
*创建者：大王 & 喵喵*
