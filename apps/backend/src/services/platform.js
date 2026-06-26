import * as platformModel from '../models/platform.js';
import prisma from '../lib/prisma.js';

export function getByProject(projectId) {
  return platformModel.findByProject(projectId);
}

export function getById(id) {
  return platformModel.findById(id);
}

export async function create(data) {
  return prisma.$transaction(async (tx) => {
    const platform = await tx.platform.create({ data });

    const defaultStatusRequest = await tx.status.findFirst({ where: { projectId: data.projectId, type: 'request', isDefault: true } });
    const defaultStatusWork = await tx.status.findFirst({ where: { projectId: data.projectId, type: 'work', isDefault: true } });
    const defaultStatusBug = await tx.status.findFirst({ where: { projectId: data.projectId, type: 'bug', isDefault: true } });
    const defaultStatusQA = await tx.status.findFirst({ where: { projectId: data.projectId, type: 'qa', isDefault: true } });
    const defaultSeverity = await tx.severity.findFirst({ where: { projectId: data.projectId, isDefault: true } });

    const featureRequests = [];
    const bugReports = [];
    const qaStories = [];

    if (defaultStatusRequest) {
      const fr = await tx.featureRequest.create({
        data: {
          projectId: data.projectId,
          platformId: platform.id,
          title: `Sample: Initial feature request for ${data.name}`,
          description: `Auto-created feature request for ${data.name}`,
          statusId: defaultStatusRequest.id,
        },
      });
      featureRequests.push({ ...fr, status: defaultStatusRequest });
    }

    if (defaultStatusBug && defaultSeverity) {
      const bug = await tx.bugReport.create({
        data: {
          platformId: platform.id,
          title: `Sample: Initial bug report for ${data.name}`,
          description: `Auto-created bug report for ${data.name}`,
          statusId: defaultStatusBug.id,
          severityId: defaultSeverity.id,
        },
      });
      bugReports.push({ ...bug, status: defaultStatusBug, severity: defaultSeverity });
    }

    const sampleFeaturesData = [
      { title: 'Login & Authentication', description: `User authentication and login flows for ${data.name}`, color: '#1A5C32' },
      { title: 'Dashboard Analytics', description: `Dashboard and analytics overview for ${data.name}`, color: '#764ABC' },
    ];

    for (let i = 0; i < sampleFeaturesData.length; i++) {
      const feat = sampleFeaturesData[i];
      const slug = `${data.slug}-${feat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      const docPage = await tx.docPage.create({
        data: {
          projectId: data.projectId,
          title: `${feat.title} - ${data.name}`,
          slug,
          platformId: platform.id,
          content: `# ${feat.title}\n\nDocumentation for ${feat.title} in ${data.name}.\n\n---\n\n## Overview\n\nThis section covers the ${feat.title.toLowerCase()} functionality of ${data.name}.\n\n## Getting Started\n\nDescribe how to get started with ${feat.title.toLowerCase()} here.\n\n## Key Features\n\n- Feature 1\n- Feature 2\n- Feature 3`,
          order: 0,
        },
      });

      await tx.feature.create({
        data: {
          projectId: data.projectId,
          platformId: platform.id,
          title: feat.title,
          description: feat.description,
          color: feat.color,
          order: i,
          docPageId: docPage.id,
        },
      });
    }

    if (defaultStatusQA) {
      const story = await tx.qAUserStory.create({
        data: {
          storyCode: `US-${platform.id}01`,
          title: `Sample: QA story for ${data.name}`,
          description: `Auto-created QA story for ${data.name}`,
          platformId: platform.id,
          statusId: defaultStatusQA.id,
          order: 0,
          steps: {
            create: [
              { stepNumber: 1, instruction: `Verify that ${data.name} loads correctly` },
              { stepNumber: 2, instruction: `Test basic functionality of ${data.name}` },
            ],
          },
        },
        include: { status: true, steps: true },
      });
      qaStories.push(story);
    }

    const fullPlatform = await tx.platform.findUnique({
      where: { id: platform.id },
      include: {
        features: { include: { subTasks: true } },
        _count: { select: { bugReports: true, qaStories: true, featureRequests: true } },
      },
    });

    return { platform: fullPlatform, featureRequests, bugReports, qaStories };
  });
}

export function update(id, data) {
  return platformModel.update(id, data);
}

export async function remove(id) {
  return prisma.$transaction(async (tx) => {
    const features = await tx.feature.findMany({
      where: { platformId: id },
      select: { docPageId: true }
    });
    const docPageIds = features.map(f => f.docPageId).filter(Boolean);

    if (docPageIds.length > 0) {
      await tx.docPage.deleteMany({
        where: { id: { in: docPageIds } }
      });
    }

    await tx.docPage.deleteMany({
      where: { platformId: id }
    });

    return tx.platform.delete({
      where: { id }
    });
  });
}
