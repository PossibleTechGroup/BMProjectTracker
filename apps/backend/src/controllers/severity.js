import * as severityService from '../services/severity.js';

export async function getByProject(req, res) {
  const severities = await severityService.getByProject(Number(req.params.projectId));
  res.json(severities);
}

export async function create(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const severity = await severityService.create({ ...req.body, createdBy: userName, updatedBy: userName });
  res.status(201).json(severity);
}

export async function update(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const severity = await severityService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(severity);
}

export async function remove(req, res) {
  await severityService.remove(Number(req.params.id));
  res.status(204).end();
}
