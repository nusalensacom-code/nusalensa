'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Smartphone,
  Save,
  ArrowLeft,
  DollarSign,
  Cpu,
  Camera,
  Battery,
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Globe,
  Radio,
} from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface DeviceFormProps {
  initialData?: any;
  brands: Brand[];
  isEdit?: boolean;
}

export function DeviceForm({ initialData, brands, isEdit = false }: DeviceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Parse JSON helper
  const parseJsonSafe = (str: any, fallback: any = {}) => {
    if (!str) return fallback;
    if (typeof str === 'object') return str;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  const initialLaunchPrices = parseJsonSafe(initialData?.launchPrices, {});
  const initialRetailPrices = parseJsonSafe(initialData?.retailPrices, {});
  const initialPros = parseJsonSafe(initialData?.pros, []);
  const initialCons = parseJsonSafe(initialData?.cons, []);

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [brandId, setBrandId] = useState(initialData?.brandId ? String(initialData.brandId) : (brands[0]?.id ? String(brands[0].id) : ''));
  const [deviceType, setDeviceType] = useState(initialData?.deviceType || 'SMARTPHONE');
  const [status, setStatus] = useState(initialData?.status || 'AVAILABLE');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));

  // Media
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [imageAltText, setImageAltText] = useState(initialData?.imageAltText || '');

  // Dates & Availability
  const [announcedDate, setAnnouncedDate] = useState(initialData?.announcedDate || '');
  const [releasedDate, setReleasedDate] = useState(initialData?.releasedDate || '');
  const [availabilityRegions, setAvailabilityRegions] = useState(initialData?.availabilityRegions || 'Global, US, UK, EU, Canada, Australia');

  // Multi-Currency Pricing
  const [launchUSD, setLaunchUSD] = useState(initialLaunchPrices.USD || '');
  const [launchGBP, setLaunchGBP] = useState(initialLaunchPrices.GBP || '');
  const [launchEUR, setLaunchEUR] = useState(initialLaunchPrices.EUR || '');
  const [launchAUD, setLaunchAUD] = useState(initialLaunchPrices.AUD || '');
  const [launchCAD, setLaunchCAD] = useState(initialLaunchPrices.CAD || '');

  const [retailUSD, setRetailUSD] = useState(initialRetailPrices.USD || '');
  const [retailGBP, setRetailGBP] = useState(initialRetailPrices.GBP || '');
  const [retailEUR, setRetailEUR] = useState(initialRetailPrices.EUR || '');
  const [retailAUD, setRetailAUD] = useState(initialRetailPrices.AUD || '');
  const [retailCAD, setRetailCAD] = useState(initialRetailPrices.CAD || '');

  // Hardware Specs
  const [networkBands, setNetworkBands] = useState(initialData?.networkBands || '');
  const [regionalVariants, setRegionalVariants] = useState(initialData?.regionalVariants || '');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [buildMaterials, setBuildMaterials] = useState(initialData?.buildMaterials || '');
  const [sim, setSim] = useState(initialData?.sim || '');

  // Display
  const [displayType, setDisplayType] = useState(initialData?.displayType || '');
  const [displaySize, setDisplaySize] = useState(initialData?.displaySize || '');
  const [displayResolution, setDisplayResolution] = useState(initialData?.displayResolution || '');
  const [displayProtection, setDisplayProtection] = useState(initialData?.displayProtection || '');

  // Platform
  const [os, setOs] = useState(initialData?.os || '');
  const [chipset, setChipset] = useState(initialData?.chipset || '');
  const [cpu, setCpu] = useState(initialData?.cpu || '');
  const [gpu, setGpu] = useState(initialData?.gpu || '');
  const [ramStorage, setRamStorage] = useState(initialData?.ramStorage || '');
  const [cardSlot, setCardSlot] = useState(Boolean(initialData?.cardSlot));

  // Camera
  const [mainCamera, setMainCamera] = useState(initialData?.mainCamera || '');
  const [selfieCamera, setSelfieCamera] = useState(initialData?.selfieCamera || '');
  const [cameraFeatures, setCameraFeatures] = useState(initialData?.cameraFeatures || '');

  // Battery & Audio
  const [batteryCapacity, setBatteryCapacity] = useState(initialData?.batteryCapacity || '');
  const [charging, setCharging] = useState(initialData?.charging || '');
  const [audioJack, setAudioJack] = useState(Boolean(initialData?.audioJack));
  const [speakers, setSpeakers] = useState(initialData?.speakers || '');
  const [connectivity, setConnectivity] = useState(initialData?.connectivity || '');
  const [sensors, setSensors] = useState(initialData?.sensors || '');

  // Editorial & Reviews
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [rating, setRating] = useState(initialData?.rating !== undefined && initialData?.rating !== null ? String(initialData.rating) : '');
  const [verdict, setVerdict] = useState(initialData?.verdict || '');
  const [prosText, setProsText] = useState(Array.isArray(initialPros) ? initialPros.join('\n') : '');
  const [consText, setConsText] = useState(Array.isArray(initialCons) ? initialCons.join('\n') : '');

  // Auto slug generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !slug.trim() || !brandId || !featuredImage.trim()) {
      setErrorMessage('Name, slug, brand, and featured image are required.');
      setIsSubmitting(false);
      return;
    }

    // Prepare multi-currency objects
    const launchPricesObj: any = {};
    if (launchUSD) launchPricesObj.USD = Number(launchUSD);
    if (launchGBP) launchPricesObj.GBP = Number(launchGBP);
    if (launchEUR) launchPricesObj.EUR = Number(launchEUR);
    if (launchAUD) launchPricesObj.AUD = Number(launchAUD);
    if (launchCAD) launchPricesObj.CAD = Number(launchCAD);

    const retailPricesObj: any = {};
    if (retailUSD) retailPricesObj.USD = Number(retailUSD);
    if (retailGBP) retailPricesObj.GBP = Number(retailGBP);
    if (retailEUR) retailPricesObj.EUR = Number(retailEUR);
    if (retailAUD) retailPricesObj.AUD = Number(retailAUD);
    if (retailCAD) retailPricesObj.CAD = Number(retailCAD);

    // Pros and Cons arrays
    const prosArray = prosText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    const consArray = consText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      brandId: parseInt(brandId, 10),
      deviceType,
      status,
      isFeatured,
      featuredImage: featuredImage.trim(),
      imageAltText: imageAltText.trim() || `${name} official render`,
      announcedDate: announcedDate.trim() || null,
      releasedDate: releasedDate.trim() || null,
      availabilityRegions: availabilityRegions.trim() || null,
      launchPrices: Object.keys(launchPricesObj).length > 0 ? launchPricesObj : null,
      retailPrices: Object.keys(retailPricesObj).length > 0 ? retailPricesObj : null,
      networkBands: networkBands.trim() || null,
      regionalVariants: regionalVariants.trim() || null,
      dimensions: dimensions.trim() || null,
      weight: weight.trim() || null,
      buildMaterials: buildMaterials.trim() || null,
      sim: sim.trim() || null,
      displayType: displayType.trim() || null,
      displaySize: displaySize.trim() || null,
      displayResolution: displayResolution.trim() || null,
      displayProtection: displayProtection.trim() || null,
      os: os.trim() || null,
      chipset: chipset.trim() || null,
      cpu: cpu.trim() || null,
      gpu: gpu.trim() || null,
      ramStorage: ramStorage.trim() || null,
      cardSlot,
      mainCamera: mainCamera.trim() || null,
      selfieCamera: selfieCamera.trim() || null,
      cameraFeatures: cameraFeatures.trim() || null,
      batteryCapacity: batteryCapacity.trim() || null,
      charging: charging.trim() || null,
      audioJack,
      speakers: speakers.trim() || null,
      connectivity: connectivity.trim() || null,
      sensors: sensors.trim() || null,
      summary: summary.trim() || null,
      rating: rating ? parseFloat(rating) : null,
      verdict: verdict.trim() || null,
      pros: prosArray.length > 0 ? prosArray : null,
      cons: consArray.length > 0 ? consArray : null,
    };

    try {
      const url = isEdit ? `/api/admin/devices/${initialData.id}` : '/api/admin/devices';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save device');
      }

      setSuccessMessage(isEdit ? 'Device updated successfully!' : 'Device created successfully!');
      router.push('/admin/devices');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/devices"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? `Edit Device: ${initialData?.name}` : 'Add New Hardware Profile'}
            </h1>
            <p className="text-sm text-gray-500">
              Complete the global specification sheet, multi-currency launch prices, and editorial verdict.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/devices"
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Device'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Smartphone className="w-5 h-5 text-primary-600" />
          Basic Information & Identification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Device Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. iPhone 16 Pro Max, Galaxy S25 Ultra"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Brand Manufacturer *</label>
            <select
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. iphone-16-pro-max"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Device Category</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="SMARTPHONE">Smartphone</option>
              <option value="TABLET">Tablet</option>
              <option value="WEARABLE">Wearable</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Availability Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="AVAILABLE">Available / On Sale</option>
              <option value="ANNOUNCED">Announced / Pre-order</option>
              <option value="RUMORED">Rumored / Anticipated</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-gray-800">
            Pin as Featured Spotlight (Displayed prominently on homepage & catalog header)
          </label>
        </div>
      </div>

      {/* Section 2: Media & Imagery */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Layers className="w-5 h-5 text-primary-600" />
          Media & Photography
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Featured Image URL *</label>
            <input
              type="text"
              required
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/... or /images/..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Image Alt Text (SEO)</label>
            <input
              type="text"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
              placeholder="e.g. iPhone 16 Pro Max official Desert Titanium render"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Multi-Currency International Pricing */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Global Pricing & Regional Availability
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Clearly distinguish official MSRP launch prices from current retail prices. Support USD, GBP, EUR, AUD, CAD.
          </p>
        </div>

        {/* Launch Prices */}
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/60">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
            Official MSRP Launch Prices
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">USD ($)</label>
              <input
                type="number"
                value={launchUSD}
                onChange={(e) => setLaunchUSD(e.target.value)}
                placeholder="1199"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">GBP (£)</label>
              <input
                type="number"
                value={launchGBP}
                onChange={(e) => setLaunchGBP(e.target.value)}
                placeholder="1199"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">EUR (€)</label>
              <input
                type="number"
                value={launchEUR}
                onChange={(e) => setLaunchEUR(e.target.value)}
                placeholder="1449"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">AUD (A$)</label>
              <input
                type="number"
                value={launchAUD}
                onChange={(e) => setLaunchAUD(e.target.value)}
                placeholder="2149"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">CAD (C$)</label>
              <input
                type="number"
                value={launchCAD}
                onChange={(e) => setLaunchCAD(e.target.value)}
                placeholder="1749"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Current Retail Prices */}
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/60">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
            Current Market Retail Prices (Street Price)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">USD ($)</label>
              <input
                type="number"
                value={retailUSD}
                onChange={(e) => setRetailUSD(e.target.value)}
                placeholder="1149"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">GBP (£)</label>
              <input
                type="number"
                value={retailGBP}
                onChange={(e) => setRetailGBP(e.target.value)}
                placeholder="1149"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">EUR (€)</label>
              <input
                type="number"
                value={retailEUR}
                onChange={(e) => setRetailEUR(e.target.value)}
                placeholder="1399"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">AUD (A$)</label>
              <input
                type="number"
                value={retailAUD}
                onChange={(e) => setRetailAUD(e.target.value)}
                placeholder="2099"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase">CAD (C$)</label>
              <input
                type="number"
                value={retailCAD}
                onChange={(e) => setRetailCAD(e.target.value)}
                placeholder="1699"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Timeline & Regions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Announced Date</label>
            <input
              type="text"
              value={announcedDate}
              onChange={(e) => setAnnouncedDate(e.target.value)}
              placeholder="e.g. September 9, 2024"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Released Date</label>
            <input
              type="text"
              value={releasedDate}
              onChange={(e) => setReleasedDate(e.target.value)}
              placeholder="e.g. September 20, 2024"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Availability Regions</label>
            <input
              type="text"
              value={availabilityRegions}
              onChange={(e) => setAvailabilityRegions(e.target.value)}
              placeholder="e.g. United States, United Kingdom, EU"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Hardware & Silicon Specifications */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Cpu className="w-5 h-5 text-indigo-600" />
          Hardware & Silicon Specifications
        </h2>

        {/* Network & Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Supported Network Bands</label>
            <input
              type="text"
              value={networkBands}
              onChange={(e) => setNetworkBands(e.target.value)}
              placeholder="e.g. 5G (Sub-6, mmWave), 4G LTE, 3G, 2G"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Regional Model Variants</label>
            <input
              type="text"
              value={regionalVariants}
              onChange={(e) => setRegionalVariants(e.target.value)}
              placeholder="e.g. A3084 (US), A3294 (Global), A3295 (China)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Dimensions</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 163 x 77.6 x 8.25 mm (6.42 x 3.06 x 0.32 in)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 227 g (8.01 oz)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Build Materials & Ingress</label>
            <input
              type="text"
              value={buildMaterials}
              onChange={(e) => setBuildMaterials(e.target.value)}
              placeholder="e.g. Titanium frame, Ceramic Shield glass, IP68"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">SIM Support</label>
            <input
              type="text"
              value={sim}
              onChange={(e) => setSim(e.target.value)}
              placeholder="e.g. Dual eSIM (US) / Nano-SIM and eSIM (Global)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Display */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Display Panel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[11px] font-medium text-gray-500 uppercase">Display Type & Refresh Rate</label>
              <input
                type="text"
                value={displayType}
                onChange={(e) => setDisplayType(e.target.value)}
                placeholder="e.g. LTPO Super Retina XDR OLED, 120Hz, 2000 nits"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500 uppercase">Display Size</label>
              <input
                type="text"
                value={displaySize}
                onChange={(e) => setDisplaySize(e.target.value)}
                placeholder="e.g. 6.9 inches"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500 uppercase">Resolution</label>
              <input
                type="text"
                value={displayResolution}
                onChange={(e) => setDisplayResolution(e.target.value)}
                placeholder="e.g. 1320 x 2868 pixels (~460 ppi)"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Platform & Memory */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Processor & Memory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500 uppercase">Operating System</label>
              <input
                type="text"
                value={os}
                onChange={(e) => setOs(e.target.value)}
                placeholder="e.g. iOS 18 / Android 15"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[11px] font-medium text-gray-500 uppercase">Chipset SoC</label>
              <input
                type="text"
                value={chipset}
                onChange={(e) => setChipset(e.target.value)}
                placeholder="e.g. Apple A18 Pro (3 nm) / Snapdragon 8 Elite"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label className="block text-[11px] font-medium text-gray-500 uppercase">RAM & Storage Configurations</label>
              <input
                type="text"
                value={ramStorage}
                onChange={(e) => setRamStorage(e.target.value)}
                placeholder="e.g. 256GB 8GB RAM, 512GB 8GB RAM, 1TB 8GB RAM"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Optics, Battery & Features */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Camera className="w-5 h-5 text-rose-600" />
          Camera, Battery & Peripherals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Main Rear Camera Array</label>
            <input
              type="text"
              value={mainCamera}
              onChange={(e) => setMainCamera(e.target.value)}
              placeholder="e.g. 48 MP wide + 12 MP 5x telephoto + 48 MP ultrawide, LiDAR"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Front Selfie Camera</label>
            <input
              type="text"
              value={selfieCamera}
              onChange={(e) => setSelfieCamera(e.target.value)}
              placeholder="e.g. 12 MP wide, SL 3D, 4K@60fps"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Battery Capacity</label>
            <input
              type="text"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(e.target.value)}
              placeholder="e.g. 4685 mAh Li-Ion"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Charging Speeds</label>
            <input
              type="text"
              value={charging}
              onChange={(e) => setCharging(e.target.value)}
              placeholder="e.g. 25W MagSafe, 50% in 30 min wired, Qi2 15W"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Connectivity</label>
            <input
              type="text"
              value={connectivity}
              onChange={(e) => setConnectivity(e.target.value)}
              placeholder="e.g. Wi-Fi 7, Bluetooth 5.3, Ultra Wideband (gen 2), USB-C 3.2 Gen 2"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Sensors & Biometrics</label>
            <input
              type="text"
              value={sensors}
              onChange={(e) => setSensors(e.target.value)}
              placeholder="e.g. Face ID / Under-display fingerprint, barometer, gyro"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Editorial Verdict & Pros / Cons */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Editorial Verdict, Score & Review Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Lab Rating (0 - 10.0)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="e.g. 9.2"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold text-amber-600"
            />
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase">Executive Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 1-sentence takeaway of this device"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-emerald-700 uppercase">Pros (1 per line)</label>
            <textarea
              rows={4}
              value={prosText}
              onChange={(e) => setProsText(e.target.value)}
              placeholder="Industry-leading battery life&#10;Incredible 4K 120fps video&#10;Bright outdoor display"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-rose-700 uppercase">Cons (1 per line)</label>
            <textarea
              rows={4}
              value={consText}
              onChange={(e) => setConsText(e.target.value)}
              placeholder="Premium price tag&#10;Charging speed caps at 25-30W&#10;Subtle design change"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700 uppercase">Editorial In-Depth Verdict</label>
          <textarea
            rows={3}
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            placeholder="Detailed editorial recommendation and buying advice for this device..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Link
          href="/admin/devices"
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Device'}
        </button>
      </div>
    </form>
  );
}

