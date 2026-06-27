import * as qaModel from '../models/qa.js';
import prisma from '../lib/prisma.js';
import { getIO } from './socket.js';
import { clearEntityReviews } from '../utils/review.js';

export function getByPlatform(platformId) {
  return qaModel.findByPlatform(platformId);
}

export async function create(data) {
  const story = await qaModel.create(data);
  await prisma.platform.update({
    where: { id: story.platformId },
    data: { updatedBy: data.updatedBy }
  });
  const platform = await prisma.platform.findUnique({ where: { id: story.platformId }, select: { projectId: true } });
  getIO().emit('project:updated', { projectId: platform?.projectId });
  return story;
}

export async function update(id, data) {
  const story = await qaModel.update(id, data);
  await clearEntityReviews(`qa-story-${id}`);
  await prisma.platform.update({
    where: { id: story.platformId },
    data: { updatedBy: data.updatedBy }
  });
  const platform = await prisma.platform.findUnique({ where: { id: story.platformId }, select: { projectId: true } });
  getIO().emit('project:updated', { projectId: platform?.projectId });
  return story;
}

export async function remove(id, userName) {
  const story = await qaModel.remove(id);
  if (story?.platformId) {
    await prisma.platform.update({
      where: { id: story.platformId },
      data: { updatedBy: userName }
    });
  }
  const platform = story?.platformId
    ? await prisma.platform.findUnique({ where: { id: story.platformId }, select: { projectId: true } })
    : null;
  getIO().emit('project:updated', { projectId: platform?.projectId });
  return { ...story, projectId: platform?.projectId };
}
