import React from 'react';
import { prisma } from '@/lib/prisma';
import { DeviceForm } from '@/components/admin/DeviceForm';

export const dynamic = 'force-dynamic';

export default async function NewDevicePage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <div className="py-2">
      <DeviceForm brands={brands} isEdit={false} />
    </div>
  );
}

