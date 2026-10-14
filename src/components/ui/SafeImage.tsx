'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const SVG_FALLBACK = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20675%22%20width%3D%221200%22%20height%3D%22675%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230f172a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231e293b%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%221200%22%20height%3D%22675%22%20fill%3D%22url(%23g)%22%2F%3E%3Ccircle%20cx%3D%22600%22%20cy%3D%22300%22%20r%3D%2270%22%20fill%3D%22%232563eb%22%20opacity%3D%220.2%22%2F%3E%3Cpath%20d%3D%22M570%20270h60v60h-60z%22%20fill%3D%22none%22%20stroke%3D%22%2360a5fa%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ccircle%20cx%3D%22585%22%20cy%3D%22285%22%20r%3D%225%22%20fill%3D%22%2360a5fa%22%2F%3E%3Cpath%20d%3D%22M570%20320l20-20%2020%2020%2010-10%2010%2010%22%20fill%3D%22none%22%20stroke%3D%22%2360a5fa%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ctext%20x%3D%22600%22%20y%3D%22380%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2226%22%20font-weight%3D%22800%22%20fill%3D%22%23f8fafc%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%223%22%3ENUSALENSA%3C%2Ftext%3E%3Ctext%20x%3D%22600%22%20y%3D%22415%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2215%22%20font-weight%3D%22500%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%3EGlobal%20Technology%20%26amp%3B%20Smartphone%20Platform%3C%2Ftext%3E%3C%2Fsvg%3E";

const ONLINE_FALLBACK = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";

export function SafeImage({ src, alt, ...props }: ImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src as string || SVG_FALLBACK);
  const [errorStage, setErrorStage] = useState<number>(0);

  const handleError = () => {
    if (errorStage === 0) {
      setErrorStage(1);
      setCurrentSrc(ONLINE_FALLBACK);
    } else if (errorStage === 1) {
      setErrorStage(2);
      setCurrentSrc(SVG_FALLBACK);
    }
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt || 'NusaLensa'}
      onError={handleError}
    />
  );
}

