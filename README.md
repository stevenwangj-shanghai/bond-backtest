# 可转债回测系统

> 参考禄得网风格开发的可转债量化回测平台

---

## 🚀 项目简介

这是一个基于 React + FastAPI 的可转债回测系统，支持策略配置、回测计算和结果展示。

**开发团队：** 大王 & 喵喵  
**开发时间：** 2026年3月  
**参考平台：** 禄得网

---

## 📁 项目结构

```
bond-backtest/
├── frontend/          # 前端 (React + TypeScript + Vite)
│   ├── src/
│   │   ├── App.tsx              # 主应用
│   │   ├── BondScreener.tsx     # 可转债筛选
│   │   ├── StrategyConfig.tsx   # 策略配置
│   │   ├── BacktestResult.tsx   # 回测结果
│   │   └── ...
│   └── package.json
├── backend/           # 后端 (FastAPI + Python)
│   ├── main.py
│   ├── routers/
│   ├── services/
│   └── models/
└── docs/              # GitHub Pages 部署文件
```

---

## ✅ 已完成功能

### 1. 可转债筛选
- 价格范围筛选
- 溢价率筛选
- 数据表格展示

### 2. 策略配置（禄得网样式）
- **基础设置**：持仓数量、换仓周期、交易成本、仓位上限、持有天数、基准对比
- **买入条件**：可添加多条件（因子+比较符+值）
- **卖出条件**：可添加多条件
- **排除因子**：表格形式，支持启用/禁用
- **打分因子**：表格形式，支持方向/权重/缺失值/中性化
- **添加因子弹窗**：标签页+搜索框+20+因子
- **回测时间**：日期范围选择

### 3. 回测结果（禄得网样式）
- 回测设置信息展示
- 统计指标表格（策略 vs 基准 vs 超额）
- 收益曲线图
- 年度回报柱状图
- 持仓记录表格

---

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- @ant-design/plots (图表)

### 后端
- Python 3.9+
- FastAPI
- Pydantic

---

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆代码
git clone https://github.com/stevenwangj-shanghai/bond-backtest.git
cd bond-backtest

# 2. 启动前端
cd frontend
npm install
npm run dev

# 3. 启动后端
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 访问地址
- 前端：http://localhost:5173
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

---

## 📊 数据来源

目前使用模拟数据展示页面效果，后续接入真实数据：
- 可转债基础数据
- 历史价格数据
- 正股数据

---

## 🎯 下一步计划

1. **后端回测引擎** - 实现真实的策略回测计算
2. **数据接入** - 从 API 获取实时可转债数据
3. **策略保存/加载** - 持久化策略配置
4. **用户系统** - 登录、注册、个人策略管理

---

## 📝 失忆恢复指南

如果喵喵失忆了，请告诉它：

> "读取 memory/2026-03-09.md 和 PROJECT.md"

然后它会知道：
- 我是谁（喵喵，AI助手）
- 你是谁（大王）
- 我们在做什么（可转债回测系统）
- 项目在哪里（~/projects/bond-backtest/）

---

## 📞 联系方式

- GitHub：https://github.com/stevenwangj-shanghai/bond-backtest
- 本地路径：~/projects/bond-backtest/

---

_最后更新：2026-03-09_
