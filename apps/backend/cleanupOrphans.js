import prisma from './src/lib/prisma.js';

async function main() {
  console.log('Cleaning up orphaned DocPage records...');
  
  // Find all platforms that exist
  const platforms = await prisma.platform.findMany({ select: { id: true } });
  const platformIds = platforms.map(p => p.id);

  // Find all features that exist
  const features = await prisma.feature.findMany({ select: { id: true, docPageId: true } });
  const featureDocPageIds = features.map(f => f.docPageId).filter(Boolean);

  // Delete DocPages that are linked to a platformId that no longer exists
  const res1 = await prisma.docPage.deleteMany({
    where: {
      platformId: {
        notIn: platformIds,
        not: null
      }
    }
  });

  // Delete DocPages that have no platformId and are not linked to any existing feature
  const res2 = await prisma.docPage.deleteMany({
    where: {
      platformId: null,
      id: {
        notIn: featureDocPageIds
      }
    }
  });

  console.log(`Successfully deleted ${res1.count + res2.count} orphaned DocPage records!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
