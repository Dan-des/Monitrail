import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@clerk/backend';

/**
 * Serverless API handler for transactions.
 * Supported methods: GET (date range), POST, PATCH, DELETE.
 *
 * Security:
 * - Every request must provide a valid Clerk session token in the Authorization header.
 * - userId is extracted ONLY from the verified token (never trusted from request body or query).
 * - Every query enforces row isolation by filtering on user_id = userId.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verify environment configuration
  const secretKey = process.env.CLERK_SECRET_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!secretKey) {
    return res.status(500).json({ error: 'Server misconfiguration: CLERK_SECRET_KEY is missing' });
  }

  if (!databaseUrl) {
    return res.status(500).json({ error: 'Server misconfiguration: DATABASE_URL is missing' });
  }

  // 2. Authenticate the request via Clerk
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  let userId: string;

  try {
    const verified = await verifyToken(token, { secretKey });
    userId = verified.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Token contains no user subject' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid session token';
    return res.status(401).json({ error: 'Unauthorized', details: message });
  }

  // 3. Connect to Neon Postgres
  const sql = neon(databaseUrl);

  // Safe body parsing helper
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
      // ── GET: List transactions for verified user (optional date range) ──
      case 'GET': {
        const { startDate, endDate } = req.query;

        if (startDate && endDate) {
          const rows = await sql`
            SELECT id, user_id, amount, category, type, description, date, created_at
            FROM transactions
            WHERE user_id = ${userId}
              AND date >= ${String(startDate)}
              AND date <= ${String(endDate)}
            ORDER BY date DESC, created_at DESC
          `;
          return res.status(200).json(rows);
        }

        const rows = await sql`
          SELECT id, user_id, amount, category, type, description, date, created_at
          FROM transactions
          WHERE user_id = ${userId}
          ORDER BY date DESC, created_at DESC
        `;
        return res.status(200).json(rows);
      }

      // ── POST: Create a new transaction ───────────────────────────────
      case 'POST': {
        const body = getBody();
        const { amount, category, type, description, date } = body;

        if (
          amount === undefined ||
          Number(amount) <= 0 ||
          !category ||
          !type ||
          !['income', 'expense'].includes(type) ||
          !date
        ) {
          return res.status(400).json({ error: 'Invalid transaction payload' });
        }

        const [created] = await sql`
          INSERT INTO transactions (user_id, amount, category, type, description, date)
          VALUES (
            ${userId},
            ${Number(amount)},
            ${String(category)},
            ${String(type)},
            ${String(description || '')},
            ${String(date)}
          )
          RETURNING id, user_id, amount, category, type, description, date, created_at
        `;

        return res.status(201).json(created);
      }

      // ── PATCH: Update an existing transaction ─────────────────────────
      case 'PATCH': {
        const body = getBody();
        const id = (req.query.id as string) || body.id;

        if (!id) {
          return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const { amount, category, type, description, date } = body;

        const [updated] = await sql`
          UPDATE transactions
          SET
            amount = COALESCE(${amount !== undefined ? Number(amount) : null}, amount),
            category = COALESCE(${category !== undefined ? String(category) : null}, category),
            type = COALESCE(${type !== undefined ? String(type) : null}, type),
            description = COALESCE(${description !== undefined ? String(description) : null}, description),
            date = COALESCE(${date !== undefined ? String(date) : null}, date)
          WHERE id = ${String(id)}
            AND user_id = ${userId}
          RETURNING id, user_id, amount, category, type, description, date, created_at
        `;

        if (!updated) {
          return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }

        return res.status(200).json(updated);
      }

      // ── DELETE: Delete an existing transaction ───────────────────────
      case 'DELETE': {
        const body = getBody();
        const id = (req.query.id as string) || body.id;

        if (!id) {
          return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const [deleted] = await sql`
          DELETE FROM transactions
          WHERE id = ${String(id)}
            AND user_id = ${userId}
          RETURNING id
        `;

        if (!deleted) {
          return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }

        return res.status(200).json({ success: true, id: deleted.id });
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query error';
    return res.status(500).json({ error: 'Internal server error', details: message });
  }
}
