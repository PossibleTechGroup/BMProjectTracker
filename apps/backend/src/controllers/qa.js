import * as qaService from '../services/qa.js';
import { getIO } from '../services/socket.js';

export async function getByPlatform(req, res) {
  const stories = await qaService.getByPlatform(Number(req.params.platformId));
  res.json(stories);
}

export async function create(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const story = await qaService.create({ ...req.body, createdBy: userName, updatedBy: userName });
  getIO().emit('project:updated', { projectId: story.projectId });
  res.status(201).json(story);
}

export async function update(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const story = await qaService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  getIO().emit('project:updated', { projectId: story.projectId });
  res.json(story);
}

export async function remove(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const deleted = await qaService.remove(Number(req.params.id), userName);
  res.status(204).end();
}
