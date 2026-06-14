import { User } from '../models/index.js';
import { verifyAccessToken } from '../utils/jwt.js';

// Track online users: userId → Set of socketIds
const onlineUsers = new Map();

export const initSocket = (io) => {

  // ── Auth middleware for sockets ─────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      const user    = await User.findById(decoded._id).select('name role department avatar');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`✅ Socket connected: ${user.name} (${user.role})`);

    // ── Join rooms automatically on connect ──────────────────────────────────
    socket.join(`user:${user._id}`);          // personal room
    socket.join(`role:${user.role}`);         // role-wide broadcasts

    if (user.department) {
      socket.join(`dept:${user.department}`); // department room
    }

    // ── Track online presence ────────────────────────────────────────────────
    if (!onlineUsers.has(user._id.toString())) {
      onlineUsers.set(user._id.toString(), new Set());
    }
    onlineUsers.get(user._id.toString()).add(socket.id);

    // Broadcast to everyone that this user is online
    io.emit('presence:online', { userId: user._id, name: user.name });

    // ── Join a conversation room ─────────────────────────────────────────────
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    // ── Leave a conversation room ────────────────────────────────────────────
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ── Join a course room ───────────────────────────────────────────────────
    socket.on('join:course', (courseId) => {
      socket.join(`course:${courseId}`);
    });

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        userId: user._id,
        name:   user.name,
        conversationId,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', {
        userId: user._id,
        conversationId,
      });
    });

    // ── Get online users list ────────────────────────────────────────────────
    socket.on('presence:list', () => {
      const onlineIds = [...onlineUsers.keys()].filter(
        id => onlineUsers.get(id)?.size > 0
      );
      socket.emit('presence:list', onlineIds);
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(user._id.toString());
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(user._id.toString());
          io.emit('presence:offline', { userId: user._id });
        }
      }
      console.log(`❌ Socket disconnected: ${user.name}`);
    });
  });
};

// Helper: emit to a specific user from anywhere in the app
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper: emit to all users in a department
export const emitToDept = (io, deptId, event, data) => {
  io.to(`dept:${deptId}`).emit(event, data);
};