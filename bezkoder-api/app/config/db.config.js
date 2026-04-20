module.exports = {
  HOST: process.env.DB_HOST || process.env.MYSQLDB_HOST || "localhost",
  USER: process.env.DB_USER || process.env.MYSQLDB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLDB_ROOT_PASSWORD || "123456",
  DB: process.env.DB_NAME || process.env.MYSQLDB_DATABASE || "bezkoder_db",
  port: process.env.DB_PORT || process.env.MYSQLDB_LOCAL_PORT || process.env.MYSQLDB_DOCKER_PORT || 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
