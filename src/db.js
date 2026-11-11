
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in the environment variables.');
}

const databaseUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port) || 5432,
    database: decodeURIComponent(databaseUrl.pathname.slice(1)),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    ssl: {
        rejectUnauthorized: false,
        servername: databaseUrl.hostname
    },
    connectionTimeoutMillis: 15000
});

let db;

if (
    process.env.NODE_ENV === 'development' &&
    process.env.ENABLE_SQL_LOGGING === 'true'
) {
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const result = await pool.query(text, params);
                const duration = Date.now() - start;

                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: result.rowCount
                });

                return result;
            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });

                throw error;
            }
        },

        async close() {
            await pool.end();
        }
    };
} else {
    db = pool;
}

const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() AS current_time');

        console.log(
            'Database connection successful:',
            result.rows[0].current_time
        );

        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export { db as default, testConnection };
