import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import "dotenv/config";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    if (err.message.includes('ECONNREFUSED')) {
        console.error('CRITICAL: Database connection refused. Is Docker running?');
    }
});

export const db = drizzle(pool, { schema });
