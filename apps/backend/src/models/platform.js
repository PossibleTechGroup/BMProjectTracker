import prisma from '../lib/prisma.js';

export function findByProject(projectId) {
  return prisma.platform.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    include: {
      features: { orderBy: { order: 'asc' }, include: { subTasks: true } },
      _count: { select: { bugReports: true, qaStories: true, featureRequests: true } },
    },
  });
}

export function findById(id) {
  return prisma.platform.findUnique({
    where: { id },
    include: {
      features: { orderBy: { order: 'asc' }, include: { subTasks: { orderBy: { order: 'asc' } } } },
      bugReports: { include: { severity: true, status: true } },
      qaStories: { include: { status: true, steps: true } },
      featureRequests: { include: { status: true, criteria: true } },
    },
  });
}

export function create(data) {
  return prisma.platform.create({ data });
}

export function update(id, data) {
  return prisma.platform.update({ where: { id }, data });
}

export function remove(id) {
  return prisma.platform.delete({ where: { id } });
}
