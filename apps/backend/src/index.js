import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import platformRoutes from './routes/platforms.js';
import statusRoutes from './routes/statuses.js';
import severityRoutes from './routes/severities.js';
import featureRoutes from './routes/features.js';
import featureRequestRoutes from './routes/featureRequests.js';
import bugRoutes from './routes/bugs.js';
import qaRoutes from './routes/qa.js';
import docRoutes from './routes/docs.js';
import commentRoutes from './routes/comments.js';
import subtaskRoutes from './routes/subtasks.js';
import reviewRoutes from './routes/reviews.js';
import { initSocket } from './services/socket.js';

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

initSocket(server);

// Public
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Project Tracker API' });
});

// Auth
app.use('/api/auth', authRoutes);

// Resources
app.use('/api/projects', projectRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/severities', severityRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/feature-requests', featureRequestRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subtasks', subtaskRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  // Map Prisma errors to a 400 with a readable message instead of a blanket 500.
  const name = err?.constructor?.name;
  if (name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Invalid data sent to the database. Check the submitted fields.' });
  }
  if (name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with these unique values already exists.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete or update because a related record still references it.' });
    }
    if (err.code === 'P2025') {
      if (req.method === 'DELETE') return res.status(204).end();
      return res.status(404).json({ error: 'Record not found.' });
    }
    return res.status(400).json({ error: err.message || 'Database request error' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
