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
  const bug = await bugService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(bug);
}

export async function remove(req, res) {
  await bugService.remove(Number(req.params.id));
  res.status(204).end();
}
