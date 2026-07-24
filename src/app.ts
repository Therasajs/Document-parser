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

// Static files (serve frontend)
app.use(express.static('public'));

// Serve React frontend for root path
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// Validate admin credentials are set
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminUsername || !adminPassword) {
  console.error(
    'FATAL: ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set.'
  );
  process.exit(1);
}

// Basic Auth Middleware (for admin operations)
const adminAuth = basicAuth({
  users: {
    [adminUsername]: adminPassword
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

// Serve frontend for all non-API routes (React Router support)
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(__dirname + '/../public/index.html');
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
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
