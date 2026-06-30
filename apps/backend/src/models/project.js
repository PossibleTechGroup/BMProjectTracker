import prisma from '../lib/prisma.js';

export function findAll() {
  return prisma.project.findMany({
    include: { members: true, platforms: { orderBy: { order: 'asc' } } },
  });
}

export function findAllWithCounts() {
  return prisma.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { members: true, platforms: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export function findById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      platforms: { orderBy: { order: 'asc' } },
      statuses: { orderBy: { order: 'asc' } },
      severities: { orderBy: { order: 'asc' } },
      members: { include: { user: true } },
      resourceLinks: { orderBy: { order: 'asc' } },
      gitRepositories: { orderBy: { order: 'asc' } },
      supplementaryDocs: { orderBy: { order: 'asc' } }
    },
  });
}

export function create(data) {
  return prisma.project.create({ data });
}

export function update(id, data) {
  return prisma.project.update({
    where: { id },
    data,
    include: {
      platforms: { orderBy: { order: 'asc' } },
      statuses: { orderBy: { order: 'asc' } },
      severities: { orderBy: { order: 'asc' } },
      members: { include: { user: true } },
      resourceLinks: { orderBy: { order: 'asc' } },
      gitRepositories: { orderBy: { order: 'asc' } },
      supplementaryDocs: { orderBy: { order: 'asc' } }
    },
  });
}

export function remove(id) {
  return prisma.project.delete({ where: { id } });
}

export function addMember(data) {
  return prisma.projectMember.create({ data });
}

export function removeMember(id) {
  return prisma.projectMember.delete({ where: { id } });
}
