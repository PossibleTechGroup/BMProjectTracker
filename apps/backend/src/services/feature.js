import * as featureModel from '../models/feature.js';
import prisma from '../lib/prisma.js';
import { getIO } from './socket.js';
import { clearEntityReviews } from '../utils/review.js';

export function getByPlatform(platformId) {
  return featureModel.findByPlatform(platformId);
}

export function create(data) {
  return featureModel.create(data);
}

export async function update(id, data) {
  const feat = await featureModel.update(id, data);
  await clearEntityReviews(`feature-${id}`);
  if (feat?.platformId) {
    await prisma.platform.update({
      where: { id: feat.platformId },
      data: { updatedBy: data.updatedBy }
    });
    getIO().emit('project:updated', { projectId: feat.projectId });
  }
  return feat;
}

export async function remove(id, userName) {
  return prisma.$transaction(async (tx) => {
    const feature = await tx.feature.findUnique({
      where: { id },
      select: { docPageId: true, platformId: true, projectId: true }
    });

    const deleted = await tx.feature.delete({ where: { id } });

    if (feature?.docPageId) {
      await tx.docPage.deleteMany({
        where: { id: feature.docPageId }
      });
    }

    if (feature?.platformId) {
      await tx.platform.update({
        where: { id: feature.platformId },
        data: { updatedBy: userName }
      });
    }
    if (feature?.projectId) {
      getIO().emit('project:updated', { projectId: feature.projectId });
    }
    return deleted;
  });
}
