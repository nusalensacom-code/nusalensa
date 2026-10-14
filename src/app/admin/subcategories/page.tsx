import React from 'react';
import CategoriesManager from '@/components/admin/CategoriesManager';

export default function AdminSubcategoriesPage() {
  return <CategoriesManager initialFilter="subcategoryOnly" />;
}
