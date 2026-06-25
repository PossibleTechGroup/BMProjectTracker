import * as platformService from '../services/platform.js';

export async function getByProject(req, res) {
  const platforms = await platformService.getByProject(Number(req.params.projectId));
  res.json(platforms);
}

export async function getById(req, res) {
  const platform = await platformService.getById(Number(req.params.id));
  if (!platform) return res.status(404).json({ error: 'Platform not found' });
  res.json(platform);
}

export async function create(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const platform = await platformService.create({ ...req.body, createdBy: userName, updatedBy: userName });
  res.status(201).json(platform);
}

export async function update(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const platform = await platformService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(platform);
}

export async function remove(req, res) {
  await platformService.remove(Number(req.params.id));
  res.status(204).end();
}
