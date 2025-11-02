# Database Browser

基于 Vue 3 + Vite + Element Plus 与 Node.js + Express + mysql2 构建的一体化数据库浏览器，可视化管理本地 MySQL `test` 数据库中的多张数据表，并自动记录所有变更操作。

## 功能特性

- 浏览数据库中的所有数据表与字段结构。
- 支持增删改查操作，自动刷新结果集。
- 所有写操作自动写入 `logs` 审计表。
- 表单字段根据表结构动态生成，自动识别主键与自增列。
- 蓝白配色的卡片式 UI，固定表头和滚动区域带来良好浏览体验。

## 快速开始

1. **安装依赖**

   ```bash
   npm install
   ```

2. **初始化数据库**

   确保本地 MySQL 已创建 `root/123456` 用户，并执行种子脚本：

   ```bash
   mysql -u root -p < seed.sql
   ```

3. **一键启动前后端**

   ```bash
   npm run dev
   ```

   - 前端默认运行于 [http://localhost:5173](http://localhost:5173)
   - 后端 API 服务运行于 [http://localhost:3000](http://localhost:3000)

## 可用脚本

| 命令             | 说明                     |
| ---------------- | ------------------------ |
| `npm run dev`    | 同时启动前端和后端开发环境 |
| `npm run build`  | 构建前端生产资源          |
| `npm run preview`| 本地预览构建产物          |
| `npm run start`  | 仅启动后端服务            |

## 接口概览

- `GET /api/tables`：列出数据库所有表名。
- `GET /api/table/:name`：获取指定表的数据与字段元信息。
- `POST /api/table/:name`：新增记录。
- `PUT /api/table/:name/:id`：根据主键更新记录。
- `DELETE /api/table/:name/:id`：根据主键删除记录。
- `GET /api/health`：返回数据库连接状态。

## 数据库结构

完整建表与示例数据位于 [seed.sql](./seed.sql)。如需恢复初始状态，可重新执行该脚本。

## 许可证

MIT
