'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  children?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  _count?: {
    devices: number;
  };
}

interface PublicLayoutWrapperProps {
  categories: CategoryItem[];
  brands: BrandItem[];
  children: React.ReactNode;
}

export function PublicLayoutWrapper({
  categories,
  brands,
  children,
}: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header categories={categories} brands={brands} />
      <main className="flex-1 w-full">{children}</main>
      <Footer categories={categories} />
    </>
  );
}

