import * as featureRequestService from '../services/featureRequest.js';

export async function getByPlatform(req, res) {
  const requests = await featureRequestService.getByPlatform(Number(req.params.platformId));
  res.json(requests);
}

export async function create(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const request = await featureRequestService.create(req.body, req.user.id, userName);
  res.status(201).json(request);
}

export async function update(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const request = await featureRequestService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(request);
}

export async function remove(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  await featureRequestService.remove(Number(req.params.id), userName);
  res.status(204).end();
}
