import * as featureService from '../services/feature.js';

export async function getByPlatform(req, res) {
  const features = await featureService.getByPlatform(Number(req.params.platformId));
  res.json(features);
}

export async function create(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const feature = await featureService.create({ ...req.body, createdBy: userName, updatedBy: userName });
  res.status(201).json(feature);
}

export async function update(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const feature = await featureService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(feature);
}

export async function remove(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  await featureService.remove(Number(req.params.id), userName);
  res.status(204).end();
}
