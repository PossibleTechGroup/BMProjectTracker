import * as subtaskService from '../services/subtask.js';

export async function getByFeature(req, res) {
  const subtasks = await subtaskService.getByFeature(Number(req.params.featureId));
  res.json(subtasks);
}

export async function create(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const subtask = await subtaskService.create({ ...req.body, createdBy: userName, updatedBy: userName });
  res.status(201).json(subtask);
}

export async function update(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const subtask = await subtaskService.update(Number(req.params.id), { ...req.body, updatedBy: userName });
  res.json(subtask);
}

export async function remove(req, res) {
  await subtaskService.remove(Number(req.params.id));
  res.status(204).end();
}
