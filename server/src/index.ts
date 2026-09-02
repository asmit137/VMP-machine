import { config } from './config/env';
import { createApp } from './app';
import { initDb } from './db/init';

async function main() {
  await initDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`VMC HMI API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
