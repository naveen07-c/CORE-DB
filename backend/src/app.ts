import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Global Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger in development
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Mount API router under /api
  app.use('/api', routes);

  // Serve the built frontend (single-service deployment) when present
  const staticDir = process.env.STATIC_DIR || path.join(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(path.join(staticDir, 'index.html'))) {
    app.use(express.static(staticDir));
    // SPA fallback: any non-API GET serves index.html
    app.get('*', (req: Request, res: Response, next: express.NextFunction) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(staticDir, 'index.html'));
    });
    console.log(`🗂️  Serving static frontend from: ${staticDir}`);
  }

  // 404 handler for unknown routes
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      code: 'ERR_NOT_FOUND',
    });
  });

  // Centralized error middleware
  app.use(errorHandler);

  return app;
};
