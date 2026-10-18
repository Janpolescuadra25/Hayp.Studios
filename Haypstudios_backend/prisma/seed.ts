import { PrismaClient, ProductStatus, InquiryStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding canonical Master Product Studio database...')

  await prisma.ownerAccount.upsert({
    where: { email: 'paulescuadra25@gmail.com' },
    update: {
      name: 'Paul Escuadra',
      role: 'OWNER',
    },
    create: {
      email: 'paulescuadra25@gmail.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyvr8.FfL6jQxR9N6T5.QpEwZ2vK4l1K',
      name: 'Paul Escuadra',
      role: 'OWNER',
    },
  })

  const vortex = await prisma.product.upsert({
    where: { slug: 'vortex' },
    update: {
      title: 'Vortex Studios',
      tagline: 'High-performance interactive web experiments',
      description: 'Creative coding and web technology showcase.',
      category: 'Creative Technology',
      status: ProductStatus.LIVE,
      date: new Date(),
      externalUrl: 'https://vortex.haypstudios.com',
      isFeatured: true,
      sortOrder: 1,
    },
    create: {
      title: 'Vortex Studios',
      slug: 'vortex',
      tagline: 'High-performance interactive web experiments',
      description: 'Creative coding and web technology showcase.',
      category: 'Creative Technology',
      status: ProductStatus.LIVE,
      date: new Date(),
      externalUrl: 'https://vortex.haypstudios.com',
      isFeatured: true,
      sortOrder: 1,
    },
  })

  const qyra = await prisma.product.upsert({
    where: { slug: 'qyra' },
    update: {
      title: 'Qyra',
      tagline: 'Autonomous financial orchestration for modern businesses',
      description: 'Intelligent automation for accounts payable and reconciliations.',
      category: 'Fintech Automation',
      status: ProductStatus.LIVE,
      date: new Date(),
      externalUrl: 'https://qyra.space',
      isFeatured: true,
      sortOrder: 2,
    },
    create: {
      title: 'Qyra',
      slug: 'qyra',
      tagline: 'Autonomous financial orchestration for modern businesses',
      description: 'Intelligent automation for accounts payable and reconciliations.',
      category: 'Fintech Automation',
      status: ProductStatus.LIVE,
      date: new Date(),
      externalUrl: 'https://qyra.space',
      isFeatured: true,
      sortOrder: 2,
    },
  })

  await prisma.productUpdate.deleteMany({})
  await prisma.productUpdate.createMany({
    data: [
      {
        productId: vortex.id,
        title: 'Vortex Core Engine v2.0 Released',
        content: 'Enhanced WebGL shader pipeline and dynamic viewport physics.',
        version: '2.0.0',
      },
      {
        productId: qyra.id,
        title: 'QuickBooks OAuth2 Sync Pipeline Live',
        content: 'Bi-directional transaction synchronization with fail-closed reconciliation.',
        version: '1.4.0',
      },
    ],
  })

  await prisma.studioEvent.upsert({
    where: { slug: 'studio-launch-demo-2026' },
    update: {
      title: 'Hayp Studios Launch & Demo Showcase',
      eventType: 'LAUNCH',
      description: 'Live demonstration of all autonomous studio products.',
      startDate: new Date('2026-11-15T18:00:00Z'),
      isPublished: true,
    },
    create: {
      title: 'Hayp Studios Launch & Demo Showcase',
      slug: 'studio-launch-demo-2026',
      eventType: 'LAUNCH',
      description: 'Live demonstration of all autonomous studio products.',
      startDate: new Date('2026-11-15T18:00:00Z'),
      isPublished: true,
    },
  })

  const settings = [
    { key: 'site_name', value: 'Hayp Studios', description: 'Public brand title' },
    { key: 'contact_email', value: 'contact@haypstudios.com', description: 'Primary contact inbox' },
    { key: 'maintenance_mode', value: 'false', description: 'Global maintenance flag' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    })
  }

  await prisma.inquiry.upsert({
    where: { id: 'seed-inquiry' },
    update: {
      name: 'System Test User',
      email: 'test@example.com',
      subject: 'Inquiry System Initial Verification',
      message: 'Automated canonical inquiry verification record.',
      status: InquiryStatus.NEW,
    },
    create: {
      id: 'seed-inquiry',
      name: 'System Test User',
      email: 'test@example.com',
      subject: 'Inquiry System Initial Verification',
      message: 'Automated canonical inquiry verification record.',
      status: InquiryStatus.NEW,
    },
  })

  console.log('Database seeding completed successfully.')
}

main()
  .catch((error) => {
    console.error('Seed error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
