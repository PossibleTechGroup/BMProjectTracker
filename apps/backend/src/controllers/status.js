import * as statusService from '../services/status.js';

export async function getByProject(req, res) {
  const { type } = req.query;
  const statuses = await statusService.getByProject(Number(req.params.projectId), type);
  res.json(statuses);
}

export async function create(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const status = await statusService.create({ ...req.body, createdBy: userName, updatedBy: userName });
  res.status(201).json(status);
}

export async function update(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const status = await statusService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(status);
}

export async function remove(req, res) {
  await statusService.remove(Number(req.params.id));
  res.status(204).end();
}
