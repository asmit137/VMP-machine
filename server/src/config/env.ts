import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl,
  // Hosted Postgres (Neon/Render/Supabase) usually requires SSL.
  pgSsl: process.env.PGSSL === 'true' || /sslmode=require/.test(databaseUrl ?? ''),
};
