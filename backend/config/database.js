require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

let sequelize;

if (process.env.DB_DIALECT === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: env === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: env === 'development' ? false : false,
  });
}

module.exports = sequelize;
