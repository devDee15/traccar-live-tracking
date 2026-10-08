import { Server } from 'socket.io';

import { logger } from '../common/logger/index.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer);
  const tracking = io.of('/tracking');

  tracking.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Tracking socket connected');
    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Tracking socket disconnected');
    });
  });

  return io;
}
