const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Use Supabase in production, SQLite in development
const USE_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;

class SupabaseDatabase {
    constructor() {
        if (!USE_SUPABASE) {
            throw new Error('Supabase configuration required. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
        }
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        console.log('Connected to Supabase PostgreSQL');
    }

    async run(sql, params = []) {
        // Convert SQLite-style ? placeholders to PostgreSQL-style $1, $2, etc.
        let pgSql = sql;
        params.forEach((_, index) => {
            pgSql = pgSql.replace('?', `$${index + 1}`);
        });

        // Handle different SQL operations
        const normalizedSql = pgSql.trim().toUpperCase();

        try {
            if (normalizedSql.startsWith('INSERT')) {
                const { data, error } = await this.supabase.rpc('exec_insert', {
                    query_sql: pgSql,
                    params: params
                });
                if (error) throw error;
                return { id: data, changes: 1 };
            } else if (normalizedSql.startsWith('UPDATE') || normalizedSql.startsWith('DELETE')) {
                const { data, error } = await this.supabase.rpc('exec_update', {
                    query_sql: pgSql,
                    params: params
                });
                if (error) throw error;
                return { changes: data || 1 };
            } else {
                const { data, error } = await this.supabase.rpc('exec_query', {
                    query_sql: pgSql,
                    params: params
                });
                if (error) throw error;
                return data;
            }
        } catch (err) {
            // Fallback: use direct table operations
            return this.fallbackOperation(sql, params);
        }
    }

    async fallbackOperation(sql, params) {
        // Parse SQL and use Supabase client methods
        const normalizedSql = sql.trim().toUpperCase();

        if (normalizedSql.startsWith('SELECT')) {
            // Parse table name from SELECT
            const match = sql.match(/FROM\s+(\w+)/i);
            if (match) {
                const table = match[1].toLowerCase();
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*');
                if (error) throw error;
                return data;
            }
        }

        throw new Error('Operation not supported in Supabase mode: ' + sql.substring(0, 50));
    }

    async get(sql, params = []) {
        const results = await this.all(sql, params);
        return results && results.length > 0 ? results[0] : null;
    }

    async all(sql, params = []) {
        // Convert SQLite-style ? to PostgreSQL-style $1, $2, etc.
        let pgSql = sql;
        params.forEach((_, index) => {
            pgSql = pgSql.replace('?', `$${index + 1}`);
        });

        try {
            // Use Supabase REST API for queries
            const match = pgSql.match(/FROM\s+(\w+)/i);
            if (match) {
                const table = match[1].toLowerCase();
                let query = this.supabase.from(table).select('*');

                // Add WHERE conditions
                const whereMatch = pgSql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);
                if (whereMatch) {
                    const whereClause = whereMatch[1].trim();
                    // Match all equality conditions: col = $1 AND col2 = $2
                    const eqMatches = whereClause.matchAll(/(\w+)\s*=\s*\$(\d+)/gi);
                    for (const eqMatch of eqMatches) {
                        const col = eqMatch[1];
                        const paramIndex = parseInt(eqMatch[2]) - 1;
                        query = query.eq(col, params[paramIndex]);
                    }
                }

                // Add ORDER BY
                const orderMatch = pgSql.match(/ORDER\s+BY\s+(\w+)\s*(ASC|DESC)?/i);
                if (orderMatch) {
                    const col = orderMatch[1];
                    const ascending = !orderMatch[2] || orderMatch[2].toUpperCase() === 'ASC';
                    query = query.order(col, { ascending });
                }

                // Add LIMIT
                const limitMatch = pgSql.match(/LIMIT\s+\$(\d+)/i);
                if (limitMatch) {
                    const limitIndex = parseInt(limitMatch[1]) - 1;
                    query = query.limit(params[limitIndex]);
                }

                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            }

            // For complex queries, use raw SQL via RPC
            const { data, error } = await this.supabase.rpc('exec_select', {
                query_sql: pgSql,
                params: params
            });
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Database query error:', err.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw err;
        }
    }

    async createDefaultAdmin() {
        try {
            const { data, error } = await this.supabase
                .from('admin_users')
                .select('*')
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                const crypto = require('crypto');
                const tempPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt.hash(tempPassword, 12);

                await this.supabase.from('admin_users').insert({
                    username: 'admin',
                    password_hash: hashedPassword,
                    role: 'admin',
                    is_active: true
                });

                console.log('╔══════════════════════════════════════════════════════════════════╗');
                console.log('║  DEFAULT ADMIN ACCOUNT CREATED                                   ║');
                console.log('╠══════════════════════════════════════════════════════════════════╣');
                console.log(`║  Username: admin                                                 ║`);
                console.log(`║  Password: ${tempPassword.substring(0, 32).padEnd(32)}  ║`);
                console.log('╠══════════════════════════════════════════════════════════════════╣');
                console.log('║  ⚠️  SECURITY WARNING: Change this password immediately!       ║');
                console.log('║  Set INITIAL_ADMIN_PASSWORD env variable to define your own.    ║');
                console.log('╚══════════════════════════════════════════════════════════════════╝');
            }
        } catch (err) {
            console.error('Error creating default admin:', err);
        }
    }

    async close() {
        // Supabase client doesn't need explicit closing
        console.log('Database connection closed');
    }
}

// Export Supabase database if configured, otherwise throw error for production
if (USE_SUPABASE) {
    module.exports = new SupabaseDatabase();
} else if (process.env.NODE_ENV === 'production') {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required in production');
} else {
    // Fallback to SQLite for local development
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const fs = require('fs');

    const DB_PATH = path.join(__dirname, 'data', 'floya.db');
    const dataDir = path.dirname(DB_PATH);

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    class SQLiteDatabase {
        constructor() {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    throw err;
                } else {
                    console.log('Connected to SQLite database');
                    this.initTables();
                }
            });
            this.db.run('PRAGMA foreign_keys = ON');
        }

        async initTables() {
            try {
                await this.run(`
                    CREATE TABLE IF NOT EXISTS products (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        description TEXT,
                        price REAL NOT NULL,
                        promo_price REAL,
                        category TEXT NOT NULL,
                        image TEXT,
                        stock INTEGER DEFAULT 0,
                        is_active INTEGER DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                await this.run(`
                    CREATE TABLE IF NOT EXISTS orders (
                        id TEXT PRIMARY KEY,
                        product_id TEXT NOT NULL,
                        product_name TEXT NOT NULL,
                        product_price REAL NOT NULL,
                        customer_name TEXT NOT NULL,
                        customer_state TEXT NOT NULL,
                        customer_phone TEXT NOT NULL,
                        status TEXT DEFAULT 'جديد',
                        notes TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    )
                `);

                await this.run(`
                    CREATE TABLE IF NOT EXISTS admin_users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        role TEXT DEFAULT 'admin',
                        is_active INTEGER DEFAULT 1,
                        token_version INTEGER DEFAULT 0,
                        last_login DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                await this.run(`
                    CREATE TABLE IF NOT EXISTS settings (
                        key TEXT PRIMARY KEY,
                        value TEXT,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                await this.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
                await this.run('CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)');
                await this.run('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
                await this.run('CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)');

                await this.createDefaultAdmin();

                console.log('Database initialized successfully');
            } catch (err) {
                console.error('Error initializing database:', err);
                throw err;
            }
        }

        async createDefaultAdmin() {
            try {
                const count = await this.get('SELECT COUNT(*) as count FROM admin_users');
                if (count.count === 0) {
                    const crypto = require('crypto');
                    const tempPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
                    const hashedPassword = await bcrypt.hash(tempPassword, 12);
                    await this.run(
                        'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
                        ['admin', hashedPassword, 'admin']
                    );
                    console.log('╔══════════════════════════════════════════════════════════════════╗');
                    console.log('║  DEFAULT ADMIN ACCOUNT CREATED                                   ║');
                    console.log('╠══════════════════════════════════════════════════════════════════╣');
                    console.log(`║  Username: admin                                                 ║`);
                    console.log(`║  Password: ${tempPassword.substring(0, 32).padEnd(32)}  ║`);
                    console.log('╠══════════════════════════════════════════════════════════════════╣');
                    console.log('║  ⚠️  SECURITY WARNING: Change this password immediately!       ║');
                    console.log('║  Set INITIAL_ADMIN_PASSWORD env variable to define your own.    ║');
                    console.log('╚══════════════════════════════════════════════════════════════════╝');
                }
            } catch (err) {
                console.error('Error creating default admin:', err);
                throw err;
            }
        }

        run(sql, params = []) {
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, function(err) {
                    if (err) {
                        console.error('SQL Error:', err.message);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, changes: this.changes });
                    }
                });
            });
        }

        get(sql, params = []) {
            return new Promise((resolve, reject) => {
                this.db.get(sql, params, (err, row) => {
                    if (err) {
                        console.error('SQL Error:', err.message);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        }

        all(sql, params = []) {
            return new Promise((resolve, reject) => {
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('SQL Error:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        }

        close() {
            return new Promise((resolve, reject) => {
                if (!this.db) {
                    resolve();
                    return;
                }
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            });
        }
    }

    module.exports = new SQLiteDatabase();
}
