import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Serve generated assets folder if requested
  app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));

  if (!isProd) {
    // In development, hook into Vite dev server middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode');
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving production build from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AETHER Server] Online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AETHER Server] Failed to initialize:', err);
  process.exit(1);
});
