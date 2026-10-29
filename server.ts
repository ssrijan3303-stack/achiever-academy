import express from 'express';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.ts';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Mount API endpoints
  app.use('/api', apiRouter);

  if (!isProduction) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Anushree Academy] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Anushree Academy] Failed to start server:', err);
  process.exit(1);
});
