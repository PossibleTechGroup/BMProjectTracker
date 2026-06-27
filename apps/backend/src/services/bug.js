import * as bugModel from '../models/bug.js';
import prisma from '../lib/prisma.js';
import { getIO } from './socket.js';

export function getByPlatform(platformId) {
  return bugModel.findByPlatform(platformId);
}

export function getByProject(projectId) {
  return bugModel.findByProject(projectId);
}

export async function create(data, userId, userName) {
  const bug = await bugModel.create({ ...data, reportedById: userId, createdBy: userName, updatedBy: userName });
  await prisma.platform.update({
    where: { id: bug.platformId },
    data: { updatedBy: userName }
  });
  const platform = await prisma.platform.findUnique({ where: { id: bug.platformId }, select: { projectId: true } });
  getIO().emit('project:updated', { projectId: platform?.projectId });
  return bug;
}

export async function update(id, data) {
  const bug = await bugModel.update(id, data);
  await prisma.platform.update({
    where: { id: bug.platformId },
    data: { updatedBy: data.updatedBy }
  });
  const platform = await prisma.platform.findUnique({ where: { id: bug.platformId }, select: { projectId: true } });
  getIO().emit('project:updated', { projectId: platform?.projectId });
  return bug;
}

export async function remove(id, userName) {
  const bug = await bugModel.remove(id);
  if (bug?.platformId) {
    await prisma.platform.update({
      where: { id: bug.platformId },
      data: { updatedBy: userName }
    });
  }
  const platform = bug?.platformId
    ? await prisma.platform.findUnique({ where: { id: bug.platformId }, select: { projectId: true } })
    : null;
  getIO().emit('project:updated', { projectId: platform?.projectId });
  return { ...bug, projectId: platform?.projectId };
}
