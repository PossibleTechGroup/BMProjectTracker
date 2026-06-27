import * as featureRequestModel from '../models/featureRequest.js';
import prisma from '../lib/prisma.js';
import { getIO } from './socket.js';

export function getByPlatform(platformId) {
  return featureRequestModel.findByPlatform(platformId);
}

export async function create(data, userId, userName) {
  const fr = await featureRequestModel.create({ ...data, requestedById: userId, createdBy: userName, updatedBy: userName });
  await prisma.platform.update({
    where: { id: fr.platformId },
    data: { updatedBy: userName }
  });
  getIO().emit('project:updated', { projectId: fr.projectId });
  return fr;
}

export async function update(id, data) {
  const fr = await featureRequestModel.update(id, data);
  await prisma.platform.update({
    where: { id: fr.platformId },
    data: { updatedBy: data.updatedBy }
  });
  getIO().emit('project:updated', { projectId: fr.projectId });
  return fr;
}

export async function remove(id, userName) {
  const fr = await featureRequestModel.remove(id);
  if (fr?.platformId) {
    await prisma.platform.update({
      where: { id: fr.platformId },
      data: { updatedBy: userName }
    });
  }
  getIO().emit('project:updated', { projectId: fr.projectId });
  return fr;
}
