import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
        for (let i = 0; i < params.length; i++) {
            pgSql = pgSql.replace('?', `$${i + 1}`);
        }

        // Handle different SQL operations using direct Supabase methods
        const normalizedSql = pgSql.trim().toUpperCase();

        try {
            if (normalizedSql.startsWith('INSERT')) {
                return await this.handleInsert(pgSql, params);
            } else if (normalizedSql.startsWith('UPDATE')) {
                return await this.handleUpdate(pgSql, params);
            } else if (normalizedSql.startsWith('DELETE')) {
                return await this.handleDelete(pgSql, params);
            } else if (normalizedSql.startsWith('SELECT') || normalizedSql.startsWith('WITH')) {
                return await this.handleSelect(pgSql, params);
            } else {
                throw new Error('Unsupported SQL operation: ' + sql.substring(0, 50));
            }
        } catch (err) {
            console.error('Database error:', err.message);
            throw err;
        }
    }

    async handleInsert(sql, params) {
        // Parse: INSERT INTO table (col1, col2) VALUES ($1, $2)
        const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
        if (!tableMatch) {
            throw new Error('Could not parse INSERT statement');
        }

        const table = tableMatch[1].toLowerCase();
        const columns = tableMatch[2].split(',').map(c => c.trim());
        const values = tableMatch[3].match(/\$?\d+/g) || [];

        const insertData = {};
        columns.forEach((col, idx) => {
            if (params[idx] !== undefined) {
                insertData[col] = params[idx];
            }
        });

        const { data, error } = await this.supabase
            .from(table)
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;
        return { id: data?.id || data?.Id, changes: 1 };
    }

    async handleUpdate(sql, params) {
        // Parse: UPDATE table SET col1 = $1, col2 = $2 WHERE id = $3
        const tableMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
        if (!tableMatch) {
            throw new Error('Could not parse UPDATE statement');
        }

        const table = tableMatch[1].toLowerCase();
        const setClause = tableMatch[2];
        const whereClause = tableMatch[3];

        // Parse SET columns
        const updateData = {};
        const setMatches = setClause.matchAll(/(\w+)\s*=\s*\$(\d+)/gi);
        for (const match of setMatches) {
            const col = match[1];
            const paramIndex = parseInt(match[2]) - 1;
            if (params[paramIndex] !== undefined) {
                updateData[col] = params[paramIndex];
            }
        }

        // Parse WHERE condition
        const whereMatches = whereClause.matchAll(/(\w+)\s*=\s*\$(\d+)/gi);
        let query = this.supabase.from(table).update(updateData);

        for (const match of whereMatches) {
            const col = match[1];
            const paramIndex = parseInt(match[2]) - 1;
            if (params[paramIndex] !== undefined) {
                query = query.eq(col, params[paramIndex]);
            }
        }

        const { data, error } = await query.select();
        if (error) throw error;
        return { changes: data?.length || 0 };
    }

    async handleDelete(sql, params) {
        // Parse: DELETE FROM table WHERE col = $1
        const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+)/i);
        if (!tableMatch) {
            throw new Error('Could not parse DELETE statement');
        }

        const table = tableMatch[1].toLowerCase();
        const whereClause = tableMatch[2];

        const whereMatches = whereClause.matchAll(/(\w+)\s*=\s*\$(\d+)/gi);
        let query = this.supabase.from(table).delete();

        for (const match of whereMatches) {
            const col = match[1];
            const paramIndex = parseInt(match[2]) - 1;
            if (params[paramIndex] !== undefined) {
                query = query.eq(col, params[paramIndex]);
            }
        }

        const { data, error } = await query;
        if (error) throw error;
        return { changes: data?.length || 0 };
    }

    async handleSelect(sql, params) {
        // Parse: SELECT ... FROM table WHERE ... ORDER BY ... LIMIT ...
        const fromMatch = sql.match(/FROM\s+(\w+)/i);
        if (!fromMatch) {
            throw new Error('Could not parse SELECT statement');
        }

        const table = fromMatch[1].toLowerCase();
        let query = this.supabase.from(table).select('*');

        // Parse WHERE conditions
        const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|HAVING|$)/i);
        if (whereMatch) {
            const whereClause = whereMatch[1].trim();

            // Handle multiple conditions with AND
            const conditions = whereClause.split(/\s+AND\s+/i);
            for (const condition of conditions) {
                const eqMatch = condition.match(/(\w+)\s*=\s*\$(\d+)/i);
                if (eqMatch) {
                    const col = eqMatch[1];
                    const paramIndex = parseInt(eqMatch[2]) - 1;
                    if (params[paramIndex] !== undefined) {
                        query = query.eq(col, params[paramIndex]);
                    }
                }
            }
        }

        // Parse ORDER BY
        const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
        if (orderMatch) {
            const col = orderMatch[1];
            const ascending = !orderMatch[2] || orderMatch[2].toUpperCase() === 'ASC';
            query = query.order(col, { ascending });
        }

        // Parse LIMIT and OFFSET
        const limitMatch = sql.match(/LIMIT\s+\$(\d+)/i);
        const offsetMatch = sql.match(/OFFSET\s+\$(\d+)/i);

        if (limitMatch) {
            const limitIndex = parseInt(limitMatch[1]) - 1;
            query = query.limit(params[limitIndex]);
        }
        if (offsetMatch) {
            const offsetIndex = parseInt(offsetMatch[1]) - 1;
            query = query.range(params[offsetIndex], (params[limitIndex] || 50) + (params[offsetIndex] || 0) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async fallbackOperation(sql, params) {
        // Parse SQL and use Supabase client methods
        const normalizedSql = sql.trim().toUpperCase();

        // Parse table name
        const tableMatch = sql.match(/FROM\s+(\w+)|INSERT\s+INTO\s+(\w+)|UPDATE\s+(\w+)/i);
        const table = tableMatch ? (tableMatch[1] || tableMatch[2] || tableMatch[3]).toLowerCase() : null;

        if (!table) {
            throw new Error('Could not parse table name from SQL: ' + sql.substring(0, 50));
        }

        if (normalizedSql.startsWith('SELECT')) {
            const { data, error } = await this.supabase.from(table).select('*');
            if (error) throw error;
            return data;
        }

        if (normalizedSql.startsWith('INSERT')) {
            // Parse column names from INSERT INTO table (col1, col2) VALUES ($1, $2)
            const colMatch = sql.match(/INSERT\s+INTO\s+\w+\s*\(([\w\s,]+)\)\s*VALUES\s*\(([\$\d\s,]+)\)/i);
            if (colMatch) {
                const columns = colMatch[1].split(',').map(c => c.trim());
                const values = colMatch[2].match(/\$(\d+)/g).map((_, idx) => params[idx]);

                const insertData = {};
                columns.forEach((col, idx) => {
                    insertData[col] = values[idx];
                });

                const { data, error } = await this.supabase
                    .from(table)
                    .insert(insertData)
                    .select();
                if (error) throw error;
                return { id: data?.[0]?.id || data?.[0]?.Id, changes: 1 };
            }
        }

        if (normalizedSql.startsWith('UPDATE')) {
            // Parse SET clause and WHERE clause
            const setMatch = sql.match(/SET\s+([\w\s=\$\?,]+)\s+WHERE/i);
            const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);

            if (setMatch && whereMatch) {
                const setClause = setMatch[1];
                const whereCol = whereMatch[1];
                const whereParamIndex = parseInt(whereMatch[2]) - 1;
                const whereValue = params[whereParamIndex];

                // Parse SET columns
                const updateData = {};
                const setParts = setClause.split(',');
                let paramIdx = 0;

                for (const part of setParts) {
                    const colMatch = part.match(/(\w+)\s*=\s*\$(\d+)/);
                    if (colMatch) {
                        const col = colMatch[1];
                        const idx = parseInt(colMatch[2]) - 1;
                        updateData[col] = params[idx];
                    }
                }

                const { data, error } = await this.supabase
                    .from(table)
                    .update(updateData)
                    .eq(whereCol, whereValue);
                if (error) throw error;
                return { changes: data?.length || 1 };
            }
        }

        if (normalizedSql.startsWith('DELETE')) {
            const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
            if (whereMatch) {
                const whereCol = whereMatch[1];
                const whereParamIndex = parseInt(whereMatch[2]) - 1;
                const whereValue = params[whereParamIndex];

                const { error } = await this.supabase
                    .from(table)
                    .delete()
                    .eq(whereCol, whereValue);
                if (error) throw error;
                return { changes: 1 };
            }
        }

        throw new Error('Operation not supported in Supabase mode: ' + sql.substring(0, 50));
    }

    async get(sql, params = []) {
        const results = await this.all(sql, params);
        return results && results.length > 0 ? results[0] : null;
    }

    async all(sql, params = []) {
        // Use the handleSelect method for all SELECT queries
        return await this.handleSelect(sql, params);
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
    const db = new SupabaseDatabase();
    export default db;
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

    const db = new SQLiteDatabase();
    export default db;
}
