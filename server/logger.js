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
