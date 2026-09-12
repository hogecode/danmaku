import type { Config } from 'drizzle-kit';

export default {
  schema: [
    './src/database/auth.schema.ts',
    './src/database/session.schema.ts',
    './src/database/content.schema.ts',
    './src/database/history.schema.ts',
  ],
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/danmaku',
  },
} satisfies Config;
