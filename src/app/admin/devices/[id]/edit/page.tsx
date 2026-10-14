import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DeviceForm } from '@/components/admin/DeviceForm';

export const dynamic = 'force-dynamic';

interface EditDevicePageProps {
  params: { id: string };
}

export default async function EditDevicePage({ params }: EditDevicePageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    notFound();
  }

  const [device, brands] = await Promise.all([
    prisma.device.findUnique({
      where: { id },
      include: { brand: true },
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

  if (!device) {
    notFound();
  }

  return (
    <div className="py-2">
      <DeviceForm initialData={device} brands={brands} isEdit={true} />
    </div>
  );
}

