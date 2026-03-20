import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import applicationsRouter from './routes/applications';
import quartersRouter from './routes/quarters';
import authRouter from './routes/auth';
import kakaoRouter from './routes/kakao';
import { getDatabase } from './db/database';
import { initializeQuartersTable } from './db/quarters';

const app = express();
const PORT = 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
getDatabase();
initializeQuartersTable();

// Routes
app.use('/api/applications', applicationsRouter);
app.use('/api/quarters', quartersRouter);
app.use('/api/auth', authRouter);
app.use('/api/kakao', kakaoRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
