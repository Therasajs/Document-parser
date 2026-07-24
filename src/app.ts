import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/connection';
import documentRoutes from './routes/documentRoutes';
import questionRoutes from './routes/questionRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Static files
app.use(express.static('public'));

// Basic Auth Middleware (for admin operations)
const adminAuth = basicAuth({
  users: {
    [process.env.ADMIN_USERNAME || 'admin']: process.env.ADMIN_PASSWORD || 'SecurePass123!'
  },
  challenge: true,
  realm: 'Document Import Engine'
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/questions', questionRoutes);

// Admin routes (protected)
app.delete('/api/questions/:id', adminAuth, (req: Request, res: Response) => {
  // Handler in questionRoutes
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║  Document Import Engine - TypeScript/Node.js          ║
║  🚀 Server running on http://localhost:${PORT}         ║
║  📊 API: http://localhost:${PORT}/api                 ║
║  ✅ Status: http://localhost:${PORT}/health           ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
