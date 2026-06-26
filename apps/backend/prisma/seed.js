import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.$transaction([
    prisma.editHistory.deleteMany(),
    prisma.docComment.deleteMany(),
    prisma.docPage.deleteMany(),
    prisma.bugAttachment.deleteMany(),
    prisma.bugReport.deleteMany(),
    prisma.QATestStep.deleteMany(),
    prisma.QAUserStory.deleteMany(),
    prisma.mockupElement.deleteMany(),
    prisma.mockupPreview.deleteMany(),
    prisma.implementationCriteria.deleteMany(),
    prisma.featureRequest.deleteMany(),
    prisma.subTask.deleteMany(),
    prisma.feature.deleteMany(),
    prisma.platform.deleteMany(),
    prisma.supplementaryDoc.deleteMany(),
    prisma.gitRepository.deleteMany(),
    prisma.resourceLink.deleteMany(),
    prisma.status.deleteMany(),
    prisma.severity.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create admin user
  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: { name: 'Admin', username: 'admin', email: 'admin@tracker.local', password, role: 'ADMIN' },
  });
  console.log(`  Created admin user: admin / admin123`);

  // Create default project
  const project = await prisma.project.create({
    data: { name: 'BM Ecosystem', slug: 'bm-ecosystem', description: 'Default project for BM Ecosystem documentation portal' },
  });
  await prisma.projectMember.create({ data: { projectId: project.id, userId: admin.id, role: 'OWNER' } });
  console.log(`  Created project: ${project.name}`);

  // Create specified users
  const usersToSeed = [
    { name: 'Mekdi', username: 'mekdi', email: 'mekdi@tracker.local', rawPassword: 'mekdi1234' },
    { name: 'Haileab', username: 'haileab', email: 'haileab@tracker.local', rawPassword: 'haileab1234' },
    { name: 'Yemisrach', username: 'yemisrach', email: 'yemisrach@tracker.local', rawPassword: 'yemisrach1234' },
    { name: 'Bereket', username: 'bereket', email: 'bereket@tracker.local', rawPassword: 'bereket1234' },
    { name: 'Simret', username: 'simret', email: 'simret@tracker.local', rawPassword: 'simret1234' },
    { name: 'Misgana', username: 'misgana', email: 'misgana@tracker.local', rawPassword: 'misgana1234' },
    { name: 'Robera (UI/UX)', username: 'robera1', email: 'robera1@tracker.local', rawPassword: 'robera1234' },
    { name: 'Robera (Developer)', username: 'robera2', email: 'robera2@tracker.local', rawPassword: 'robera1234' },
  ];

  for (const u of usersToSeed) {
    const hashed = await bcrypt.hash(u.rawPassword, 10);
    const createdUser = await prisma.user.create({
      data: { name: u.name, username: u.username, email: u.email, password: hashed, role: 'USER' }
    });
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: createdUser.id, role: 'MEMBER' }
    });
    console.log(`  Created user: ${createdUser.username} / ${u.rawPassword}`);
  }

  // Create statuses
  for (const [type, statuses] of Object.entries(STATUS_TEMPLATES)) {
    for (const s of statuses) {
      await prisma.status.create({ data: { ...s, projectId: project.id, type } });
    }
  }
  console.log('  Created project statuses');

  // Create severities
  for (const s of SEVERITY_TEMPLATES) {
    await prisma.severity.create({ data: { ...s, projectId: project.id } });
  }
  console.log('  Created project severities');

  // Create a sample platform
  const defaultStatus = await prisma.status.findFirst({ where: { projectId: project.id, type: 'task', isDefault: true } });
  const defaultSeverity = await prisma.severity.findFirst({ where: { projectId: project.id, isDefault: true } });

  const platform = await prisma.platform.create({
    data: {
      projectId: project.id,
      name: 'BM Admin Panel',
      slug: 'bm-admin-panel',
      description: 'Admin panel for BM Ecosystem',
      repoUrl: 'https://github.com/org/bm-admin-panel',
      figmaUrl: 'https://figma.com/file/bm-admin',
      postmanUrl: '',
      customUrl: '',
      order: 0,
    },
  });
  console.log(`  Created platform: ${platform.name}`);

  if (defaultStatus && defaultSeverity) {
    const feature = await prisma.feature.create({
      data: { projectId: project.id, platformId: platform.id, title: 'User Management', description: 'User CRUD operations', order: 0 },
    });
    await prisma.subTask.create({
      data: { projectId: project.id, featureId: feature.id, title: 'Implement user listing', statusId: defaultStatus.id, order: 0 },
    });
    console.log('  Created sample feature + subtask');
  }

  console.log('\nSeed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
