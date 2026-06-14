import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import './models/index.js'; // pre-register all models
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './sockets/index.js';

// Route imports (we'll fill these in Phase 3+)
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import departmentRoutes from './routes/department.routes.js';

import courseRoutes     from './routes/course.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import gradeRoutes      from './routes/grade.routes.js';
import messageRoutes from './routes/message.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
const httpServer = createServer(app);

const allowCorsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (origin === process.env.CLIENT_URL) return callback(null, true);
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
    return callback(null, true);
  }
  callback(new Error('Not allowed by CORS'));
};

const corsOptions = { origin: allowCorsOrigin, credentials: true };

// Socket.IO setup
export const io = new Server(httpServer, { cors: corsOptions });
initSocket(io);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/courses',    courseRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/grades',     gradeRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// Global error handler
app.use(errorHandler);

// Start
connectDB().then(() => {
  httpServer.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});