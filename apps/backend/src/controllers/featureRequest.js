import * as featureRequestService from '../services/featureRequest.js';
import { getIO } from '../services/socket.js';

export async function getByPlatform(req, res) {
  const requests = await featureRequestService.getByPlatform(Number(req.params.platformId));
  res.json(requests);
}

export async function create(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const request = await featureRequestService.create(req.body, req.user.id, userName);
  getIO().emit('project:updated', { projectId: request.projectId });
  res.status(201).json(request);
}

export async function update(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const request = await featureRequestService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  getIO().emit('project:updated', { projectId: request.projectId });
  res.json(request);
}

export async function remove(req, res) {
  const deleted = await featureRequestService.remove(Number(req.params.id));
  if (deleted?.projectId) {
    getIO().emit('project:updated', { projectId: deleted.projectId });
  }
  res.status(204).end();
}
