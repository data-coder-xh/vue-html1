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
