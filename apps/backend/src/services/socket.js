import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitEntityUpdate(entityType, data) {
  if (io) {
    io.emit('entity:updated', { entityType, data });
  }
}

export function emitEntityDelete(entityType, id) {
  if (io) {
    io.emit('entity:deleted', { entityType, id });
  }
}
