import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get review status for a specific entity
router.get('/:entityKey', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.entityReview.findMany({
      where: { entityKey: req.params.entityKey },
      orderBy: { reviewedAt: 'asc' },
      include: { user: { select: { id: true, name: true, username: true } } }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update a review
router.post('/:entityKey', authenticate, async (req, res) => {
  try {
    const { entityKey } = req.params;
    const userId = req.user.id;
    const userName = req.user.name || req.user.username || 'Unknown';

    await prisma.entityReview.upsert({
      where: {
        entityKey_userId: {
          entityKey,
          userId
        }
      },
      update: {
        userName,
        reviewedAt: new Date()
      },
      create: {
        entityKey,
        userId,
        userName
      }
    });
    
    const reviews = await prisma.entityReview.findMany({
      where: { entityKey },
      orderBy: { reviewedAt: 'asc' },
      include: { user: { select: { id: true, name: true, username: true } } }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
