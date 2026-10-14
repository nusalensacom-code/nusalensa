'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle,
  Clock,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Device {
  id: number;
  name: string;
  slug: string;
  brandId: number;
  brand: Brand;
  deviceType: string;
  featuredImage: string;
  announcedDate?: string | null;
  releasedDate?: string | null;
  status: string;
  chipset?: string | null;
  displaySize?: string | null;
  batteryCapacity?: string | null;
  launchPrices?: string | null;
  retailPrices?: string | null;
  rating?: number | null;
  isFeatured: boolean;
  lastVerified: string | Date;
  updatedAt: string | Date;
}

interface DevicesManagerProps {
  initialDevices: Device[];
  brands: Brand[];
}

export default function DevicesManager({
  initialDevices,
  brands,
}: DevicesManagerProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        search === '' ||
        device.name.toLowerCase().includes(search.toLowerCase()) ||
        device.brand.name.toLowerCase().includes(search.toLowerCase()) ||
        (device.chipset && device.chipset.toLowerCase().includes(search.toLowerCase()));

      const matchesBrand =
        selectedBrand === 'ALL' || device.brandId === parseInt(selectedBrand, 10);

      const matchesType =
        selectedType === 'ALL' || device.deviceType === selectedType;

      return matchesSearch && matchesBrand && matchesType;
    });
  }, [devices, search, selectedBrand, selectedType]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    setIsDeleting(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/admin/devices/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete device');
      }

      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error deleting device');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const getPrimaryPrice = (pricesJson?: string | null) => {
    if (!pricesJson) return null;
    try {
      const prices = JSON.parse(pricesJson);
      if (prices.USD) return formatCurrency(prices.USD, 'USD');
      if (prices.EUR) return formatCurrency(prices.EUR, 'EUR');
      if (prices.GBP) return formatCurrency(prices.GBP, 'GBP');
      return 'Price varies';
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary-600" />
            Device Database & Specifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage global smartphone and tablet hardware profiles, multi-currency pricing, and benchmark scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/devices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Device
          </Link>
        </div>
      </div>

      {/* Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Devices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{devices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Smartphones</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {devices.filter((d) => d.deviceType === 'SMARTPHONE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tablets</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {devices.filter((d) => d.deviceType === 'TABLET').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Brands</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{brands.length}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or chipset..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase">Brand:</span>
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Types</option>
            <option value="SMARTPHONE">Smartphones</option>
            <option value="TABLET">Tablets</option>
            <option value="WEARABLE">Wearables</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Brand / Type</th>
                <th className="py-3 px-4">Key Specs</th>
                <th className="py-3 px-4">Launch Price</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Smartphone className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-gray-600">No devices found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {search || selectedBrand !== 'ALL' || selectedType !== 'ALL'
                        ? 'Try clearing your filters or search keywords.'
                        : 'Click "Add New Device" to create your first specification profile.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  const launchPriceDisplay = getPrimaryPrice(device.launchPrices);
                  return (
                    <tr key={device.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                            {device.featuredImage ? (
                              <Image
                                src={device.featuredImage}
                                alt={device.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <Smartphone className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 hover:text-primary-600">
                              <Link href={`/admin/devices/${device.id}/edit`}>
                                {device.name}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                              /{device.brand.slug}/{device.slug}
                            </div>
                            {device.isFeatured && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded border border-amber-200">
                                Featured Spotlight
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{device.brand.name}</div>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono mt-1">
                          {device.deviceType}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs text-xs space-y-1">
                        {device.chipset && (
                          <div className="truncate text-gray-700">
                            <span className="text-gray-400">Chip:</span> {device.chipset}
                          </div>
                        )}
                        {device.displaySize && (
                          <div className="truncate text-gray-500">
                            <span className="text-gray-400">Display:</span> {device.displaySize}
                          </div>
                        )}
                        {device.batteryCapacity && (
                          <div className="truncate text-gray-500">
                            <span className="text-gray-400">Battery:</span> {device.batteryCapacity}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {launchPriceDisplay ? (
                          <span className="font-semibold text-gray-900">{launchPriceDisplay}</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Varies by market</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {device.rating ? (
                          <div className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{device.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400 font-normal">/10</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Unrated</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            device.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : device.status === 'ANNOUNCED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : device.status === 'RUMORED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {device.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/phones/${device.brand.slug}/${device.slug}`}
                            target="_blank"
                            title="View Public Spec Page"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/devices/${device.id}/edit`}
                            title="Edit Device"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(device.id)}
                            disabled={isDeleting && deletingId === device.id}
                            title="Delete Device"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

