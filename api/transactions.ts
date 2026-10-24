import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@clerk/backend';

// ── Validation Helpers (exported for standalone verification) ────────────────

export const isValidUUID = (val: unknown): boolean => {
  if (typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

export const isValidAmount = (val: unknown): boolean => {
  if (typeof val === 'number') {
    return !isNaN(val) && isFinite(val) && val > 0;
  }
  if (typeof val === 'string' && val.trim() !== '') {
    const num = Number(val);
    return !isNaN(num) && isFinite(num) && num > 0;
  }
  return false;
};

export const isValidType = (val: unknown): boolean => {
  return val === 'income' || val === 'expense';
};

export const isValidCategory = (val: unknown): boolean => {
  return typeof val === 'string' && val.trim().length > 0;
};

export const isValidDateString = (val: unknown): boolean => {
  if (typeof val !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return false;
  }
  const [year, month, day] = val.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
};

// ── Database Connection Cache (reused across invocations) ────────────────────
let cachedSql: ReturnType<typeof neon> | null = null;
let cachedDbUrl: string | null = null;

function getSql(databaseUrl: string) {
  if (!cachedSql || cachedDbUrl !== databaseUrl) {
    cachedSql = neon(databaseUrl);
    cachedDbUrl = databaseUrl;
  }
  return cachedSql;
}

// ── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verify environment configuration (generic 500 on failure, no leaks)
  const secretKey = process.env.CLERK_SECRET_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!secretKey || !databaseUrl) {
    console.error('Server configuration error: missing CLERK_SECRET_KEY or DATABASE_URL');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // 2. Authenticate the request via Clerk session token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  let userId: string;

  try {
    const verified = await verifyToken(token, { secretKey });
    userId = verified.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (err: unknown) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 3. Connect to Neon Postgres (reused connection)
  const sql = getSql(databaseUrl);

  const getBody = () => {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  };

  try {
    switch (req.method) {
      // ── GET: Query transactions for authenticated user ──────────────────
      case 'GET': {
        const { startDate, endDate } = req.query;

        if (startDate && endDate) {
          if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
          }

          const rows = await sql`
            SELECT id, user_id, amount::float8 AS amount, category, type, description, date::text AS date, created_at
            FROM transactions
            WHERE user_id = ${userId}
              AND date >= ${String(startDate)}
              AND date <= ${String(endDate)}
            ORDER BY date DESC, created_at DESC
          `;
          return res.status(200).json(rows);
        }

        const rows = await sql`
          SELECT id, user_id, amount::float8 AS amount, category, type, description, date::text AS date, created_at
          FROM transactions
          WHERE user_id = ${userId}
          ORDER BY date DESC, created_at DESC
        `;
        return res.status(200).json(rows);
      }

      // ── POST: Insert transaction (user_id strictly from token) ─────────
      case 'POST': {
        const body = getBody();

        // user_id in body is completely ignored; only allowable fields are extracted:
        const { amount, category, type, description, date } = body;

        // Validation: amount > 0, type is 'income'/'expense', non-empty category, valid YYYY-MM-DD
        if (
          !isValidAmount(amount) ||
          !isValidType(type) ||
          !isValidCategory(category) ||
          !isValidDateString(date) ||
          (description !== undefined && typeof description !== 'string')
        ) {
          return res.status(400).json({
            error: 'Invalid input. Required: amount (> 0), type (income|expense), category, date (YYYY-MM-DD).'
          });
        }

        const [created] = await sql`
          INSERT INTO transactions (user_id, amount, category, type, description, date)
          VALUES (
            ${userId},
            ${Number(amount)},
            ${String(category).trim()},
            ${String(type)},
            ${description ? String(description).trim() : ''},
            ${String(date)}
          )
          RETURNING id, user_id, amount::float8 AS amount, category, type, description, date::text AS date, created_at
        `;

        return res.status(201).json(created);
      }

      // ── PATCH: Update transaction ─────────────────────────────────────
      case 'PATCH': {
        const body = getBody();
        const id = (req.query.id as string) || body.id;

        // Check 1: ID must be a valid UUID before any database call
        if (!id || !isValidUUID(id)) {
          return res.status(400).json({ error: 'Valid UUID transaction ID is required' });
        }

        // Only allow updating: amount, category, type, description, date.
        // user_id, id, and created_at in body are strictly ignored.
        const { amount, category, type, description, date } = body;

        // Ensure at least one updatable field is provided
        if (
          amount === undefined &&
          category === undefined &&
          type === undefined &&
          description === undefined &&
          date === undefined
        ) {
          return res.status(400).json({ error: 'No valid update fields provided' });
        }

        // Validate each provided field
        if (amount !== undefined && !isValidAmount(amount)) {
          return res.status(400).json({ error: 'amount must be a number greater than 0' });
        }
        if (type !== undefined && !isValidType(type)) {
          return res.status(400).json({ error: "type must be 'income' or 'expense'" });
        }
        if (category !== undefined && !isValidCategory(category)) {
          return res.status(400).json({ error: 'category must be a non-empty string' });
        }
        if (date !== undefined && !isValidDateString(date)) {
          return res.status(400).json({ error: 'date must be a valid YYYY-MM-DD string' });
        }
        if (description !== undefined && typeof description !== 'string') {
          return res.status(400).json({ error: 'description must be a string' });
        }

        // Static parameterized query: no SQL concatenation of column names or values
        const [updated] = await sql`
          UPDATE transactions
          SET
            amount = COALESCE(${amount !== undefined ? Number(amount) : null}, amount),
            category = COALESCE(${category !== undefined ? String(category).trim() : null}, category),
            type = COALESCE(${type !== undefined ? String(type) : null}, type),
            description = COALESCE(${description !== undefined ? String(description).trim() : null}, description),
            date = COALESCE(${date !== undefined ? String(date) : null}, date)
          WHERE id = ${String(id)}
            AND user_id = ${userId}
          RETURNING id, user_id, amount::float8 AS amount, category, type, description, date::text AS date, created_at
        `;

        // If ID belongs to another user (or does not exist), returns 404 and changes nothing
        if (!updated) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        return res.status(200).json(updated);
      }

      // ── DELETE: Delete transaction ────────────────────────────────────
      case 'DELETE': {
        const body = getBody();
        const id = (req.query.id as string) || body.id;

        // Check 1: ID must be a valid UUID before any database call
        if (!id || !isValidUUID(id)) {
          return res.status(400).json({ error: 'Valid UUID transaction ID is required' });
        }

        // If ID belongs to another user, 0 rows deleted, returns 404 and changes nothing
        const [deleted] = await sql`
          DELETE FROM transactions
          WHERE id = ${String(id)}
            AND user_id = ${userId}
          RETURNING id
        `;

        if (!deleted) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        return res.status(200).json({ success: true, id: deleted.id });
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
      }
    }
  } catch (err: unknown) {
    // Log internally for debugging, never leak err.message to the client
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
