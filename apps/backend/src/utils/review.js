import prisma from '../lib/prisma.js';
import { getIO } from '../services/socket.js';

export async function clearEntityReviews(entityKey) {
  await prisma.entityReview.deleteMany({ where: { entityKey } });
  try {
    getIO().emit('reviews:cleared', { entityKey });
  } catch (e) {
    // socket not initialized
  }
}
