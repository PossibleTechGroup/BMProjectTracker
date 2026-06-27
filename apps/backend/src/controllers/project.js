import * as projectService from '../services/project.js';
import { getIO } from '../services/socket.js';

export async function getAll(req, res) {
  const projects = await projectService.getAll();
  res.json(projects);
}

export async function getById(req, res) {
  const project = await projectService.getById(Number(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
}

export async function create(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const project = await projectService.create(req.body, req.user.id, userName);
  res.status(201).json(project);
}

export async function update(req, res) {
  const userName = req.user.name || req.user.username || 'Unknown';
  const project = await projectService.update(Number(req.params.id), req.body, userName);
  getIO().emit('project:updated', { projectId: project.id });
  res.json(project);
}

export async function remove(req, res) {
  await projectService.remove(Number(req.params.id));
  res.status(204).end();
}

export async function addMember(req, res) {
  const { userId, role } = req.body;
  const member = await projectService.addMember(Number(req.params.id), userId, role);
  res.status(201).json(member);
}

export async function removeMember(req, res) {
  await projectService.removeMember(Number(req.params.memberId));
  res.status(204).end();
}
