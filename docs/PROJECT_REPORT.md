# 项目概览

## 目录结构

```text
.
├── docs/
│   └── PROJECT_REPORT.md
├── index.html
├── package.json
├── public/
│   └── favicon.ico
├── README.md
├── seed.sql
├── server/
│   ├── db.js
│   ├── index.js
│   └── logger.js
├── src/
│   ├── App.vue
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   │   └── TableBrowser.vue
│   ├── main.ts
│   ├── shims-vue.d.ts
│   ├── types/
│   │   └── database.ts
│   └── utils/
│       └── format.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## package.json 启动脚本

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
    "dev:client": "vite",
    "dev:server": "nodemon server/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/index.js"
  }
}
```

## 关键文件完整代码

### package.json

```json
{
  "name": "database-browser",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
    "dev:client": "vite",
    "dev:server": "nodemon server/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "element-plus": "^2.5.6",
    "express": "^4.18.2",
    "mysql2": "^3.9.3",
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@vitejs/plugin-vue": "^5.0.4",
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.3",
    "typescript": "^5.4.2",
    "vite": "^5.1.4"
  }
}
```

### vite.config.ts

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

### src/main.ts

```ts
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import './assets/main.css';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
```

### src/assets/main.css

```css
:root {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #1f2d3d;
  background-color: #f2f6fc;
  line-height: 1.5;
}

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #f5faff 0%, #e4efff 100%);
}

#app {
  min-height: 100vh;
}

.el-card {
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.el-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(64, 158, 255, 0.15);
}

.table-card .el-card__body {
  padding: 0;
}

a {
  color: inherit;
  text-decoration: none;
}
```

### src/App.vue

```vue
<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>数据库可视化浏览器</h1>
        <p>浏览、管理并实时记录操作日志的轻量级平台</p>
      </div>
      <div class="connection-chip">
        <span class="chip-label">当前连接</span>
        <strong>{{ connectionLabel }}</strong>
      </div>
    </header>

    <TableBrowser />

    <footer class="app-footer">
      <span>数据库操作将自动写入日志表 logs。</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TableBrowser from './components/TableBrowser.vue';

const connectionLabel = ref('root@localhost / test');

onMounted(async () => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) return;
    const data = await response.json();
    connectionLabel.value = `${data.user}@${data.host} / ${data.database}`;
  } catch (error) {
    console.warn('无法加载数据库信息', error);
  }
});
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 32px clamp(24px, 6vw, 80px) 48px;
  box-sizing: border-box;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 16px;
}

.title-block h1 {
  margin: 0;
  font-size: 28px;
  color: #1f2d3d;
}

.title-block p {
  margin: 8px 0 0;
  font-size: 15px;
  color: #5c6b7a;
}

.connection-chip {
  background: rgba(64, 158, 255, 0.12);
  color: #1f6fd5;
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px rgba(64, 158, 255, 0.2);
  text-align: right;
}

.connection-chip .chip-label {
  display: block;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #409eff;
}

.connection-chip strong {
  font-size: 15px;
}

.app-footer {
  margin-top: auto;
  text-align: center;
  color: #90a4c0;
  font-size: 13px;
  padding-top: 32px;
}

@media (max-width: 768px) {
  .app-shell {
    padding: 24px;
  }

  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .connection-chip {
    align-self: stretch;
    text-align: left;
  }
}
</style>
```

### src/components/TableBrowser.vue

```vue
<template>
  <div class="browser-layout">
    <el-card class="tables-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据表</span>
          <el-button size="small" type="primary" text @click="refreshTables">
            刷新
          </el-button>
        </div>
      </template>
      <el-menu
        v-if="tables.length"
        :default-active="selectedTable"
        class="table-menu"
        @select="handleSelectTable"
      >
        <el-menu-item v-for="table in tables" :key="table" :index="table">
          <span>{{ table }}</span>
        </el-menu-item>
      </el-menu>
      <el-empty v-else description="暂无数据表" />
    </el-card>

    <el-card class="table-card" v-loading="tableLoading">
      <template #header>
        <div class="card-header">
          <div>
            <h2 v-if="selectedTable" class="table-title">{{ selectedTable }}</h2>
            <p v-if="selectedTable" class="table-subtitle">
              共 {{ rows.length }} 条记录 · 主键字段：
              <strong>{{ primaryKey || '未检测到' }}</strong>
            </p>
            <p v-else class="table-placeholder">请选择左侧数据表</p>
          </div>
          <div class="toolbar" v-if="selectedTable">
            <el-button type="primary" @click="openCreateDialog" :disabled="!columns.length">
              新增记录
            </el-button>
            <el-button @click="refreshCurrentTable" :disabled="!selectedTable">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="selectedTable" class="table-wrapper">
        <el-table
          :data="rows"
          border
          stripe
          height="520"
          empty-text="暂无记录"
        >
          <el-table-column
            v-for="column in columns"
            :key="column.Field"
            :prop="column.Field"
            :label="column.Field"
            :min-width="columnWidth(column)"
            show-overflow-tooltip
          />
          <el-table-column label="操作" fixed="right" width="160">
            <template #default="{ row }">
              <el-space>
                <el-button size="small" type="primary" text @click="openEditDialog(row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" text @click="confirmDelete(row)">
                  删除
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-empty v-else description="请选择数据表" />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增记录' : '编辑记录'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="formModel" label-width="120px" class="form-grid">
        <el-form-item
          v-for="column in editableColumns"
          :key="column.Field"
          :label="column.Field"
          :required="column.Null === 'NO' && !isAutoIncrement(column)"
        >
          <el-date-picker
            v-if="isDateType(column.Type)"
            v-model="formModel[column.Field]"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期"
            style="width: 100%"
            clearable
          />
          <el-input-number
            v-else-if="isNumericType(column.Type)"
            v-model="formModel[column.Field]"
            :controls="false"
            style="width: 100%"
            :disabled="isPrimaryKey(column) && dialogMode === 'edit'"
          />
          <el-input
            v-else
            v-model="formModel[column.Field]"
            clearable
            :disabled="isAutoIncrement(column) || (isPrimaryKey(column) && dialogMode === 'edit')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ColumnDefinition, TablePayload } from '@/types/database';
import { isDateType, isNumericType, normalizeValue } from '@/utils/format';

const tables = ref<string[]>([]);
const selectedTable = ref('');
const columns = ref<ColumnDefinition[]>([]);
const rows = ref<Record<string, any>[]>([]);
const primaryKey = ref<string | null>(null);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const formModel = reactive<Record<string, any>>({});
const editingKeyValue = ref<string | number | null>(null);

const editableColumns = computed(() => columns.value);

function isAutoIncrement(column: ColumnDefinition) {
  return column.Extra.includes('auto_increment');
}

function isPrimaryKey(column: ColumnDefinition) {
  return column.Key === 'PRI';
}

function columnWidth(column: ColumnDefinition) {
  if (isPrimaryKey(column)) return 140;
  if (isNumericType(column.Type)) return 120;
  if (isDateType(column.Type)) return 180;
  return 160;
}

async function refreshTables() {
  try {
    const response = await fetch('/api/tables');
    if (!response.ok) throw new Error('无法获取数据表');
    const payload = await response.json();
    const tableNames: string[] = Array.isArray(payload)
      ? payload
      : payload.tables || [];
    tables.value = tableNames;
    if (!selectedTable.value && tableNames.length) {
      handleSelectTable(tableNames[0]);
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据表失败');
  }
}

async function fetchTableData(name: string) {
  tableLoading.value = true;
  try {
    const response = await fetch(`/api/table/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('读取数据失败');
    const data: TablePayload = await response.json();
    columns.value = data.columns;
    rows.value = data.rows;
    primaryKey.value = data.primaryKey;
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    tableLoading.value = false;
  }
}

function handleSelectTable(name: string) {
  selectedTable.value = name;
  fetchTableData(name);
}

function initializeForm(row?: Record<string, any>) {
  columns.value.forEach((column) => {
    const field = column.Field;
    if (row) {
      const value = row[field];
      if (value === null || value === undefined) {
        formModel[field] = null;
      } else if (isDateType(column.Type)) {
        formModel[field] = value;
      } else if (isNumericType(column.Type)) {
        formModel[field] = Number(value);
      } else {
        formModel[field] = value;
      }
    } else {
      formModel[field] = isNumericType(column.Type) ? null : '';
    }
  });
}

function openCreateDialog() {
  dialogMode.value = 'create';
  initializeForm();
  editingKeyValue.value = null;
  dialogVisible.value = true;
}

function openEditDialog(row: Record<string, any>) {
  dialogMode.value = 'edit';
  initializeForm(row);
  if (primaryKey.value) {
    editingKeyValue.value = row[primaryKey.value];
  }
  dialogVisible.value = true;
}

async function submitForm() {
  if (!selectedTable.value) return;
  const payload: Record<string, any> = {};
  columns.value.forEach((column) => {
    const field = column.Field;
    const value = formModel[field];
    if (dialogMode.value === 'create' && isAutoIncrement(column) && (value === null || value === '')) {
      return;
    }
    if (isDateType(column.Type)) {
      payload[field] = value || null;
    } else if (isNumericType(column.Type)) {
      payload[field] = value === null || value === '' ? null : Number(value);
    } else {
      payload[field] = normalizeValue(value);
    }
  });

  try {
    if (dialogMode.value === 'create') {
      const response = await fetch(`/api/table/${encodeURIComponent(selectedTable.value)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('新增记录失败');
      ElMessage.success('记录新增成功');
    } else {
      if (!primaryKey.value || editingKeyValue.value === null) {
        throw new Error('无法识别主键，更新失败');
      }
      const response = await fetch(
        `/api/table/${encodeURIComponent(selectedTable.value)}/${encodeURIComponent(String(editingKeyValue.value))}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) throw new Error('更新记录失败');
      ElMessage.success('记录更新成功');
    }
    dialogVisible.value = false;
    await fetchTableData(selectedTable.value);
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败');
  }
}

async function confirmDelete(row: Record<string, any>) {
  if (!primaryKey.value) {
    ElMessage.error('未检测到主键，无法删除');
    return;
  }
  const keyValue = row[primaryKey.value];
  try {
    await ElMessageBox.confirm(`确认删除 ${primaryKey.value} = ${keyValue} 的记录吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    });
    const response = await fetch(
      `/api/table/${encodeURIComponent(selectedTable.value)}/${encodeURIComponent(String(keyValue))}`,
      {
        method: 'DELETE'
      }
    );
    if (!response.ok) throw new Error('删除失败');
    ElMessage.success('记录删除成功');
    await fetchTableData(selectedTable.value);
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') return;
    ElMessage.error(error.message || '删除失败');
  }
}

function refreshCurrentTable() {
  if (selectedTable.value) {
    fetchTableData(selectedTable.value);
  }
}

onMounted(() => {
  refreshTables();
});
</script>

<style scoped>
.browser-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 24px;
}

.table-menu {
  border: none;
}

.table-menu .el-menu-item {
  border-radius: 12px;
  margin: 4px 12px;
  height: 44px;
  line-height: 44px;
}

.table-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #5ca9ff 0%, #409eff 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: #1f2d3d;
}

.table-title {
  margin: 0;
  font-size: 22px;
  color: #1f2d3d;
}

.table-subtitle {
  margin: 6px 0 0;
  color: #5c6b7a;
  font-size: 13px;
}

.table-placeholder {
  margin: 0;
  color: #90a4c0;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.table-wrapper {
  padding: 0 12px 12px;
}

.form-grid {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1024px) {
  .browser-layout {
    grid-template-columns: 1fr;
  }
}
</style>
```

### server/db.js

```js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
};

const pool = mysql.createPool(dbConfig);

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('✅ MySQL 已连接：%s@%s/%s', dbConfig.user, dbConfig.host, dbConfig.database);
  } finally {
    connection.release();
  }
}

async function getPrimaryKey(tableName) {
  const [rows] = await pool.query('SHOW KEYS FROM ?? WHERE Key_name = ?;', [tableName, 'PRIMARY']);
  if (!rows.length) {
    return null;
  }
  return rows[0].Column_name;
}

async function getTableColumns(tableName) {
  const [rows] = await pool.query('DESCRIBE ??;', [tableName]);
  return rows;
}

module.exports = {
  pool,
  initDatabase,
  getPrimaryKey,
  getTableColumns,
  dbConfig
};
```

### server/logger.js

```js
const { pool } = require('./db');

function formatDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function writeLog({ who = 'admin', tableName, operation, keyValue }) {
  await pool.query(
    'INSERT INTO logs (who, time, table_name, operation, key_value) VALUES (?, ?, ?, ?, ?);',
    [who, formatDateTime(), tableName, operation, keyValue]
  );
}

module.exports = {
  writeLog
};
```

### server/index.js

```js
const express = require('express');
const cors = require('cors');
const { pool, initDatabase, getPrimaryKey, getTableColumns, dbConfig } = require('./db');
const { writeLog } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function buildInsertStatement(tableName, data) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return { sql: 'INSERT INTO ?? () VALUES ()', params: [tableName] };
  }
  const columns = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  const columnPlaceholders = columns.map(() => '??').join(', ');
  const valuePlaceholders = columns.map(() => '?').join(', ');
  return {
    sql: `INSERT INTO ?? (${columnPlaceholders}) VALUES (${valuePlaceholders});`,
    params: [tableName, ...columns, ...values]
  };
}

function buildUpdateStatement(tableName, data, primaryKey, keyValue) {
  const entries = Object.entries(data).filter(([key, value]) => key !== primaryKey && value !== undefined);
  if (!entries.length) {
    return null;
  }
  const segments = entries.map(() => '?? = ?').join(', ');
  const params = [tableName];
  entries.forEach(([key, value]) => {
    params.push(key, value);
  });
  params.push(primaryKey, keyValue);
  return {
    sql: `UPDATE ?? SET ${segments} WHERE ?? = ?;`,
    params
  };
}

app.get('/api/tables', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SHOW TABLES;');
  const tables = rows.map((row) => Object.values(row)[0]);
  res.json({ tables });
}));

app.get('/api/table/:name', asyncHandler(async (req, res) => {
  const tableName = req.params.name;
  const [records] = await pool.query('SELECT * FROM ??;', [tableName]);
  const columns = await getTableColumns(tableName);
  const primaryKey = await getPrimaryKey(tableName);
  res.json({
    columns,
    rows: records,
    primaryKey
  });
}));

app.post('/api/table/:name', asyncHandler(async (req, res) => {
  const tableName = req.params.name;
  const payload = req.body || {};
  const insert = buildInsertStatement(tableName, payload);
  const [result] = await pool.query(insert.sql, insert.params);
  const primaryKey = await getPrimaryKey(tableName);
  const keyValue = primaryKey ? payload[primaryKey] ?? result.insertId ?? null : null;
  if (primaryKey) {
    await writeLog({ tableName, operation: 'INSERT', keyValue: keyValue !== null ? String(keyValue) : null });
  }
  res.status(201).json({
    affectedRows: result.affectedRows,
    insertId: result.insertId,
    primaryKey,
    keyValue
  });
}));

app.put('/api/table/:name/:id', asyncHandler(async (req, res) => {
  const tableName = req.params.name;
  const id = req.params.id;
  const payload = req.body || {};
  const primaryKey = await getPrimaryKey(tableName);
  if (!primaryKey) {
    return res.status(400).json({ message: '未检测到主键，无法更新' });
  }
  const update = buildUpdateStatement(tableName, payload, primaryKey, id);
  if (!update) {
    return res.json({ message: '没有需要更新的字段', affectedRows: 0 });
  }
  const [result] = await pool.query(update.sql, update.params);
  await writeLog({ tableName, operation: 'UPDATE', keyValue: String(id) });
  res.json({ affectedRows: result.affectedRows });
}));

app.delete('/api/table/:name/:id', asyncHandler(async (req, res) => {
  const tableName = req.params.name;
  const id = req.params.id;
  const primaryKey = await getPrimaryKey(tableName);
  if (!primaryKey) {
    return res.status(400).json({ message: '未检测到主键，无法删除' });
  }
  const [result] = await pool.query('DELETE FROM ?? WHERE ?? = ?;', [tableName, primaryKey, id]);
  await writeLog({ tableName, operation: 'DELETE', keyValue: String(id) });
  res.json({ affectedRows: result.affectedRows });
}));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: dbConfig.database,
    host: dbConfig.host,
    user: dbConfig.user
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: '服务器内部错误', detail: err.message });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('无法连接数据库:', error.message);
    process.exit(1);
  });
```

### seed.sql

```sql
CREATE DATABASE IF NOT EXISTS test;
USE test;

DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE employees
(
  eid VARCHAR(3) NOT NULL,
  ename VARCHAR(15),
  city VARCHAR(15),
  PRIMARY KEY (eid)
);

CREATE TABLE customers
(
  cid VARCHAR(4) NOT NULL,
  cname VARCHAR(15),
  city VARCHAR(15),
  visits_made INT(5),
  last_visit_time DATETIME,
  PRIMARY KEY (cid)
);

CREATE TABLE suppliers
(
  sid VARCHAR(2) NOT NULL,
  sname VARCHAR(15) NOT NULL,
  city VARCHAR(15),
  telephone_no CHAR(10),
  PRIMARY KEY (sid),
  UNIQUE (sname)
);

CREATE TABLE products
(
  pid VARCHAR(4) NOT NULL,
  pname VARCHAR(15) NOT NULL,
  qoh INT(5) NOT NULL,
  qoh_threshold INT(5),
  original_price DECIMAL(6,2),
  discnt_rate DECIMAL(3,2),
  sid VARCHAR(2),
  PRIMARY KEY (pid),
  FOREIGN KEY (sid) REFERENCES suppliers (sid)
);

CREATE TABLE purchases
(
  purid INT NOT NULL,
  cid VARCHAR(4) NOT NULL,
  eid VARCHAR(3) NOT NULL,
  pid VARCHAR(4) NOT NULL,
  qty INT(5),
  ptime DATETIME,
  total_price DECIMAL(7,2),
  PRIMARY KEY (purid),
  FOREIGN KEY (cid) REFERENCES customers(cid),
  FOREIGN KEY (eid) REFERENCES employees(eid),
  FOREIGN KEY (pid) REFERENCES products(pid)
);

CREATE TABLE logs
(
  logid INT(5) NOT NULL AUTO_INCREMENT,
  who VARCHAR(10) NOT NULL,
  time DATETIME NOT NULL,
  table_name VARCHAR(20) NOT NULL,
  operation VARCHAR(6) NOT NULL,
  key_value VARCHAR(4),
  PRIMARY KEY (logid)
);

INSERT INTO employees (eid, ename, city) VALUES
('E01', 'Alice', 'Beijing'),
('E02', 'Brian', 'Shanghai'),
('E03', 'Carol', 'Shenzhen');

INSERT INTO customers (cid, cname, city, visits_made, last_visit_time) VALUES
('C001', 'Acme Co', 'Beijing', 12, '2024-05-10 10:30:00'),
('C002', 'Blue Sky', 'Shanghai', 5, '2024-05-08 15:45:00'),
('C003', 'Nova Labs', 'Shenzhen', 8, '2024-05-06 09:15:00');

INSERT INTO suppliers (sid, sname, city, telephone_no) VALUES
('S1', 'Sunrise', 'Beijing', '0101234567'),
('S2', 'Harbor', 'Shanghai', '0217654321'),
('S3', 'Everest', 'Shenzhen', '0755123456');

INSERT INTO products (pid, pname, qoh, qoh_threshold, original_price, discnt_rate, sid) VALUES
('P001', 'Laptop', 45, 20, 5500.00, 0.10, 'S1'),
('P002', 'Router', 120, 40, 320.00, 0.05, 'S2'),
('P003', 'Monitor', 60, 25, 1280.00, 0.15, 'S3');

INSERT INTO purchases (purid, cid, eid, pid, qty, ptime, total_price) VALUES
(1001, 'C001', 'E01', 'P001', 2, '2024-05-11 11:20:00', 9900.00),
(1002, 'C002', 'E02', 'P002', 5, '2024-05-09 14:10:00', 1520.00),
(1003, 'C003', 'E03', 'P003', 1, '2024-05-07 16:40:00', 1088.00);

INSERT INTO logs (who, time, table_name, operation, key_value) VALUES
('system', '2024-05-01 08:00:00', 'employees', 'INIT', NULL),
('system', '2024-05-01 08:05:00', 'customers', 'INIT', NULL);
```
