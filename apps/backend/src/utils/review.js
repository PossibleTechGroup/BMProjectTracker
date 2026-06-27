import prisma from '../lib/prisma.js';

export async function clearEntityReviews(entityKey) {
  await prisma.entityReview.deleteMany({ where: { entityKey } });
}
