import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'club_website',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    };

const migrationsDir = path.resolve(__dirname, '../migrations');
const seedsDir = path.resolve(__dirname, '../seeds');

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: connectionConfig,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: migrationsDir,
      extension: 'ts',
    },
    seeds: {
      directory: seedsDir,
      extension: 'ts',
    },
  },

  production: {
    client: 'pg',
    connection: connectionConfig,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: migrationsDir,
    },
    seeds: {
      directory: seedsDir,
    },
  },
};

export default config;
