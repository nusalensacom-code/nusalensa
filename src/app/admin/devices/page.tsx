import React from 'react';
import { prisma } from '@/lib/prisma';
import DevicesManager from '@/components/admin/DevicesManager';

export const dynamic = 'force-dynamic';

export default async function AdminDevicesPage() {
  const [devices, brands] = await Promise.all([
    prisma.device.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        brand: true,
      },
    }),
    prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return <DevicesManager initialDevices={devices as any} brands={brands} />;
}

