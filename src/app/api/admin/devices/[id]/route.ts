import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 });
    }

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        brand: true,
      },
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json({ device });
  } catch (error: any) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      brandId,
      deviceType = 'SMARTPHONE',
      featuredImage,
      imageAltText,
      gallery,
      announcedDate,
      releasedDate,
      status = 'AVAILABLE',
      networkBands,
      regionalVariants,
      dimensions,
      weight,
      buildMaterials,
      sim,
      displayType,
      displaySize,
      displayResolution,
      displayProtection,
      os,
      chipset,
      cpu,
      gpu,
      ramStorage,
      cardSlot = false,
      mainCamera,
      selfieCamera,
      cameraFeatures,
      batteryCapacity,
      charging,
      audioJack = false,
      speakers,
      connectivity,
      sensors,
      launchPrices,
      retailPrices,
      availabilityRegions,
      summary,
      pros,
      cons,
      verdict,
      rating,
      sources,
      isFeatured = false,
    } = body;

    // Check slug collision
    if (slug) {
      const existing = await prisma.device.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'A device with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const device = await prisma.device.update({
      where: { id },
      data: {
        name,
        slug,
        brandId: brandId ? parseInt(brandId, 10) : undefined,
        deviceType,
        featuredImage,
        imageAltText: imageAltText || `${name} official product render`,
        gallery: gallery ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : null,
        announcedDate: announcedDate || null,
        releasedDate: releasedDate || null,
        status,
        networkBands: networkBands || null,
        regionalVariants: regionalVariants || null,
        dimensions: dimensions || null,
        weight: weight || null,
        buildMaterials: buildMaterials || null,
        sim: sim || null,
        displayType: displayType || null,
        displaySize: displaySize || null,
        displayResolution: displayResolution || null,
        displayProtection: displayProtection || null,
        os: os || null,
        chipset: chipset || null,
        cpu: cpu || null,
        gpu: gpu || null,
        ramStorage: ramStorage ? (typeof ramStorage === 'string' ? ramStorage : JSON.stringify(ramStorage)) : null,
        cardSlot: Boolean(cardSlot),
        mainCamera: mainCamera || null,
        selfieCamera: selfieCamera || null,
        cameraFeatures: cameraFeatures || null,
        batteryCapacity: batteryCapacity || null,
        charging: charging || null,
        audioJack: Boolean(audioJack),
        speakers: speakers || null,
        connectivity: connectivity || null,
        sensors: sensors || null,
        launchPrices: launchPrices ? (typeof launchPrices === 'string' ? launchPrices : JSON.stringify(launchPrices)) : null,
        retailPrices: retailPrices ? (typeof retailPrices === 'string' ? retailPrices : JSON.stringify(retailPrices)) : null,
        availabilityRegions: availabilityRegions || null,
        summary: summary || null,
        pros: pros ? (typeof pros === 'string' ? pros : JSON.stringify(pros)) : null,
        cons: cons ? (typeof cons === 'string' ? cons : JSON.stringify(cons)) : null,
        verdict: verdict || null,
        rating: rating !== undefined && rating !== null && rating !== '' ? parseFloat(rating) : null,
        sources: sources ? (typeof sources === 'string' ? sources : JSON.stringify(sources)) : null,
        isFeatured: Boolean(isFeatured),
        lastVerified: new Date(),
      },
      include: {
        brand: true,
      },
    });

    return NextResponse.json({ device });
  } catch (error: any) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Failed to update device', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 });
    }

    await prisma.device.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Device deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { error: 'Failed to delete device', details: error.message },
      { status: 500 }
    );
  }
}

