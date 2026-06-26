import * as bugService from '../services/bug.js';

export async function getByPlatform(req, res) {
  const bugs = await bugService.getByPlatform(Number(req.params.platformId));
  res.json(bugs);
}

export async function getByProject(req, res) {
  const bugs = await bugService.getByProject(Number(req.params.projectId));
  res.json(bugs);
}

export async function create(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const bug = await bugService.create(req.body, req.user.id, userName);
  res.status(201).json(bug);
}

export async function update(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const data = { ...req.body };
  if (data.platformId !== undefined) data.platformId = Number(data.platformId);
  if (data.severityId !== undefined) data.severityId = Number(data.severityId);
  if (data.statusId !== undefined) data.statusId = Number(data.statusId);
  if (data.reportedById !== undefined) data.reportedById = data.reportedById ? Number(data.reportedById) : null;
  if (data.assignedToId !== undefined) data.assignedToId = data.assignedToId ? Number(data.assignedToId) : null;
  const bug = await bugService.update(Number(req.params.id), { ...data, updatedBy: userName });
  res.json(bug);
}

export async function remove(req, res) {
  await bugService.remove(Number(req.params.id));
  res.status(204).end();
}
