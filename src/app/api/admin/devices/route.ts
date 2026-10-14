import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId');
    const deviceType = searchParams.get('type');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { chipset: { contains: search } },
      ];
    }

    if (brandId && brandId !== 'ALL') {
      where.brandId = parseInt(brandId, 10);
    }

    if (deviceType && deviceType !== 'ALL') {
      where.deviceType = deviceType;
    }

    const devices = await prisma.device.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        brand: true,
      },
    });

    return NextResponse.json({ devices });
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (!name || !slug || !brandId || !featuredImage) {
      return NextResponse.json(
        { error: 'Name, slug, brand, and featured image are required' },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.device.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'A device with this slug already exists' },
        { status: 409 }
      );
    }

    const device = await prisma.device.create({
      data: {
        name,
        slug,
        brandId: parseInt(brandId, 10),
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

    return NextResponse.json({ device }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { error: 'Failed to create device', details: error.message },
      { status: 500 }
    );
  }
}

