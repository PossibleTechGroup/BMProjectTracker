import * as projectService from '../services/project.js';
import prisma from '../lib/prisma.js';

export async function getAll(req, res) {
  const projects = await projectService.getAll();
  res.json(projects);
}

export async function getAllWithCounts(req, res) {
  const projects = await projectService.getAllWithCounts();
  res.json(projects);
}

export async function getById(req, res) {
  const project = await projectService.getById(Number(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
}

// Status & severity templates — same as the seed file
const STATUS_TEMPLATES = {
  task: [
    { name: 'Pending', slug: 'pending', color: '#9CA3AF', order: 0, isDefault: true },
    { name: 'In Progress', slug: 'in_progress', color: '#3B82F6', order: 1 },
    { name: 'Review', slug: 'review', color: '#F59E0B', order: 2 },
    { name: 'Done', slug: 'done', color: '#10B981', order: 3, isFinal: true },
  ],
  bug: [
    { name: 'Pending', slug: 'pending', color: '#9CA3AF', order: 0, isDefault: true },
    { name: 'In Progress', slug: 'in_progress', color: '#3B82F6', order: 1 },
    { name: 'Review', slug: 'review', color: '#F59E0B', order: 2 },
    { name: 'Resolved', slug: 'resolved', color: '#10B981', order: 3, isFinal: true },
  ],
  qa: [
    { name: 'Pending', slug: 'pending', color: '#9CA3AF', order: 0, isDefault: true },
    { name: 'In Progress', slug: 'in_progress', color: '#3B82F6', order: 1 },
    { name: 'Passed', slug: 'passed', color: '#10B981', order: 2, isFinal: true },
    { name: 'Failed', slug: 'failed', color: '#EF4444', order: 3, isFinal: true },
  ],
  work: [
    { name: 'Pending', slug: 'pending', color: '#9CA3AF', order: 0, isDefault: true },
    { name: 'In Progress', slug: 'in_progress', color: '#3B82F6', order: 1 },
    { name: 'Review', slug: 'review', color: '#F59E0B', order: 2 },
    { name: 'Done', slug: 'done', color: '#10B981', order: 3, isFinal: true },
  ],
  request: [
    { name: 'Pending', slug: 'pending', color: '#9CA3AF', order: 0, isDefault: true },
    { name: 'Review', slug: 'review', color: '#F59E0B', order: 1 },
    { name: 'Approved', slug: 'approved', color: '#10B981', order: 2, isFinal: true },
    { name: 'Rejected', slug: 'rejected', color: '#EF4444', order: 3, isFinal: true },
  ],
};

const SEVERITY_TEMPLATES = [
  { name: 'Low', slug: 'low', color: '#6B7280', order: 0 },
  { name: 'Medium', slug: 'medium', color: '#F59E0B', order: 1, isDefault: true },
  { name: 'High', slug: 'high', color: '#F97316', order: 2 },
  { name: 'Critical', slug: 'critical', color: '#EF4444', order: 3 },
];

export async function create(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const project = await projectService.create(req.body, req.user.id, userName);

  // Auto-create status & severity templates for new projects
  for (const [type, statuses] of Object.entries(STATUS_TEMPLATES)) {
    for (const s of statuses) {
      await prisma.status.create({ data: { ...s, projectId: project.id, type } });
    }
  }
  for (const s of SEVERITY_TEMPLATES) {
    await prisma.severity.create({ data: { ...s, projectId: project.id } });
  }

  // Add all existing users as members of the new project
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  for (const u of allUsers) {
    if (u.id === req.user.id) continue; // creator already added as OWNER
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: u.id, role: 'MEMBER' },
    }).catch(() => {}); // ignore if already exists
  }

  res.status(201).json(project);
}

export async function update(req, res) {
  const userName = req.user.username || req.user.name || 'Unknown';
  const project = await projectService.update(Number(req.params.id), req.body, userName);
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
