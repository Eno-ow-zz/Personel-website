'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScratchAvatar({ topImage, bottomImage, size = 300 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const topImageRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState(size);
  const [isRevealed, setIsRevealed] = useState(false);

  const brushRadius = canvasSize * 0.08;

  const loadAndDrawTopImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      topImageRef.current = img;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    };
    img.src = topImage;
  }, [topImage]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setCanvasSize(width);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    loadAndDrawTopImage();
  }, [loadAndDrawTopImage, canvasSize]);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = (pos) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();

    if (lastPoint.current) {
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = brushRadius * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    lastPoint.current = pos;
    checkRevealPercentage();
  };

  const checkRevealPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    if (transparent / total > 0.6) {
      setIsRevealed(true);
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPosition(e);
    if (pos) {
      lastPoint.current = pos;
      scratch(pos);
    }
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getPosition(e);
    if (pos) scratch(pos);
  };

  const handleEnd = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const handleLeave = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto select-none"
      style={{ width: '100%', maxWidth: `${size}px`, aspectRatio: '1' }}
      onMouseLeave={handleLeave}
      onTouchEnd={handleLeave}
    >
      <img
        src={bottomImage}
        alt="Real photo"
        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        style={{
          opacity: 1,
          transition: 'opacity 0.3s ease',
        }}
        draggable={false}
      />

      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="absolute inset-0 w-full h-full rounded-2xl"
        style={{
          cursor: 'crosshair',
          opacity: isRevealed ? 0 : 1,
          transition: isRevealed ? 'opacity 0.5s ease' : 'none',
          touchAction: 'none',
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {!isRevealed && (
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="text-xs px-2 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
            scratch me ✨
          </span>
        </div>
      )}
    </div>
  );
}
