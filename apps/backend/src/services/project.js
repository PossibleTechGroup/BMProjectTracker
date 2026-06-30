import prisma from '../lib/prisma.js';
import * as projectModel from '../models/project.js';
import { getIO } from './socket.js';

export function getAll() {
  return projectModel.findAll();
}

export function getAllWithCounts() {
  return projectModel.findAllWithCounts();
}

export function getById(id) {
  return projectModel.findById(id);
}

export function create(data, userId, userName) {
  return projectModel.create({
    ...data,
    createdBy: userName,
    updatedBy: userName,
    members: { create: { userId, role: 'OWNER' } },
  });
}

export async function update(id, data, userName) {
  const project = await projectModel.update(id, { ...data, updatedBy: userName });
  getIO().emit('project:updated', { projectId: project.id });
  return project;
}

export async function remove(id, userName) {
  await prisma.$transaction(async (tx) => {
    await tx.supplementaryDoc.deleteMany({ where: { projectId: id } });
    await tx.gitRepository.deleteMany({ where: { projectId: id } });
    await tx.resourceLink.deleteMany({ where: { projectId: id } });
    await tx.editHistory.deleteMany({ where: { projectId: id } });
    await tx.docPage.deleteMany({ where: { projectId: id } });

    const platforms = await tx.platform.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const platformIds = platforms.map(p => p.id);

    if (platformIds.length > 0) {
      const features = await tx.feature.findMany({
        where: { platformId: { in: platformIds } },
        select: { id: true },
      });
      const featureIds = features.map(f => f.id);

      if (featureIds.length > 0) {
        await tx.subTask.deleteMany({ where: { featureId: { in: featureIds } } });
      }

      const featureRequests = await tx.featureRequest.findMany({
        where: { platformId: { in: platformIds } },
        select: { id: true },
      });
      const frIds = featureRequests.map(f => f.id);
      if (frIds.length > 0) {
        await tx.implementationCriteria.deleteMany({ where: { featureRequestId: { in: frIds } } });

        const mockups = await tx.mockupPreview.findMany({
          where: { featureRequestId: { in: frIds } },
          select: { id: true },
        });
        const mockupIds = mockups.map(m => m.id);
        if (mockupIds.length > 0) {
          await tx.mockupElement.deleteMany({ where: { mockupPreviewId: { in: mockupIds } } });
        }
        await tx.mockupPreview.deleteMany({ where: { featureRequestId: { in: frIds } } });
      }

      await tx.feature.deleteMany({ where: { platformId: { in: platformIds } } });
      await tx.featureRequest.deleteMany({ where: { platformId: { in: platformIds } } });

      const qaStories = await tx.qaUserStory.findMany({
        where: { platformId: { in: platformIds } },
        select: { id: true },
      });
      const qaIds = qaStories.map(q => q.id);
      if (qaIds.length > 0) {
        await tx.qATestStep.deleteMany({ where: { qaUserStoryId: { in: qaIds } } });
      }

      await tx.qaUserStory.deleteMany({ where: { platformId: { in: platformIds } } });

      const bugs = await tx.bugReport.findMany({
        where: { platformId: { in: platformIds } },
        select: { id: true },
      });
      const bugIds = bugs.map(b => b.id);
      if (bugIds.length > 0) {
        await tx.bugAttachment.deleteMany({ where: { bugReportId: { in: bugIds } } });
      }

      await tx.bugReport.deleteMany({ where: { platformId: { in: platformIds } } });
    }

    await tx.project.delete({ where: { id } });
  });

  getIO().emit('project:updated', { projectId: id });
}

export function addMember(projectId, userId, role) {
  return projectModel.addMember({ projectId, userId, role: role || 'MEMBER' });
}

export function removeMember(id) {
  return projectModel.removeMember(id);
}
