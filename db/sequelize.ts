import { Sequelize } from 'sequelize';

const database = process.env.POSTGRES_DB || 'booking_db';
const username = process.env.POSTGRES_USER || 'booking';
const password = process.env.POSTGRES_PASSWORD || 'booking_pass';
const host = process.env.POSTGRES_HOST || 'localhost';
const port = Number(process.env.POSTGRES_PORT || 5432);

export const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
