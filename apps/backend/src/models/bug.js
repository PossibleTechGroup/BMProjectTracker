import prisma from '../lib/prisma.js';

export function findByPlatform(platformId) {
  return prisma.bugReport.findMany({
    where: { platformId },
    orderBy: { createdAt: 'desc' },
    include: { severity: true, status: true, reportedBy: true, assignedTo: true, attachments: true },
  });
}

export function findByProject(projectId) {
  return prisma.bugReport.findMany({
    where: { platform: { projectId } },
    orderBy: { createdAt: 'desc' },
    include: { platform: true, severity: true, status: true, reportedBy: true, assignedTo: true, attachments: true },
  });
}

export function create(data) {
  // `imageUrl` isn't a BugReport column — it maps to a BugAttachment row.
  const { imageUrl, ...rest } = data;
  return prisma.bugReport.create({
    data: {
      ...rest,
      ...(imageUrl ? { attachments: { create: [{ imageUrl }] } } : {}),
    },
    include: { severity: true, status: true, reportedBy: true, assignedTo: true, attachments: true },
  });
}

export function update(id, data) {
  const { imageUrl, ...rest } = data;
  return prisma.bugReport.update({
    where: { id },
    data: {
      ...rest,
      ...(imageUrl ? { attachments: { create: [{ imageUrl }] } } : {}),
    },
    include: { severity: true, status: true, reportedBy: true, assignedTo: true, attachments: true },
  });
}

export function remove(id) {
  return prisma.bugReport.delete({ where: { id } });
}
