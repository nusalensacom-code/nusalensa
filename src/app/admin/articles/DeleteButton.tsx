'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteArticleButtonProps {
  articleId: number;
  articleTitle: string;
}

export function DeleteArticleButton({ articleId, articleTitle }: DeleteArticleButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete the article: "${articleTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete article.');
      }
    } catch (e) {
      alert('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      type="button"
      className="p-1 text-slate-400 hover:text-red-600 inline-block transition-colors"
      title="Delete Article"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
