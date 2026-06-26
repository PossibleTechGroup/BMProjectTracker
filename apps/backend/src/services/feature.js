import * as featureModel from '../models/feature.js';
import prisma from '../lib/prisma.js';

export function getByPlatform(platformId) {
  return featureModel.findByPlatform(platformId);
}

export function create(data) {
  return featureModel.create(data);
}

export function update(id, data) {
  return featureModel.update(id, data);
}

export async function remove(id) {
  return prisma.$transaction(async (tx) => {
    const feature = await tx.feature.findUnique({
      where: { id },
      select: { docPageId: true }
    });

    const deleted = await tx.feature.delete({ where: { id } });

    if (feature?.docPageId) {
      await tx.docPage.deleteMany({
        where: { id: feature.docPageId }
      });
    }
    return deleted;
  });
}
