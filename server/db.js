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
