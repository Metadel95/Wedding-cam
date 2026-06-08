"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Photo {
  url: string;
  publicId: string;
  createdAt: string;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        if (data.photos) setPhotos(data.photos);
        else setError("Could not load photos.");
      })
      .catch(() => setError("Could not load photos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ position: "relative", zIndex: 1 }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ background: "rgba(26,16,37,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="text-sm opacity-50">← Camera</Link>
        <span className="font-fun text-lg" style={{ color: "var(--pink)" }}>Gallery 🖼️</span>
        <span className="text-sm opacity-40">{photos.length} shots</span>
      </div>

      {/* Ticker */}
      {photos.length > 0 && (
        <div
          className="ticker-wrap py-2"
          style={{ background: "var(--pink)", color: "white", fontSize: 12, fontWeight: 600, letterSpacing: "0.15em" }}
        >
          <div className="ticker-inner">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>✦ SARA & AHMED ✦ JUNE 14 2026 ✦ CAPTURED WITH LOVE &nbsp;&nbsp;</span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-3 pt-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-4xl float">📸</p>
            <p className="opacity-50 text-sm">Developing photos…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">😢</p>
            <p className="opacity-50 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="text-center py-32">
            <p className="text-5xl mb-4">📷</p>
            <p className="font-semibold text-lg mb-2">No photos yet!</p>
            <p className="opacity-50 text-sm mb-8">Be the first to capture a moment.</p>
            <Link
              href="/"
              className="inline-block py-4 px-8 rounded-2xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--pink), var(--coral))" }}
            >
              Take a Photo 📸
            </Link>
          </div>
        )}

        {photos.length > 0 && (
          <div className="columns-2 gap-2">
            {photos.map((photo, idx) => (
              <div
                key={photo.publicId}
                className="mb-2 rounded-xl overflow-hidden cursor-pointer"
                style={{
                  border: "2px solid rgba(255,255,255,0.06)",
                  animation: `slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) ${Math.min(idx * 0.05, 0.4)}s both`
                }}
                onClick={() => setLightbox(photo)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Wedding moment"
                  className="w-full block"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,5,20,0.97)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 text-white opacity-60 text-xl w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt="Wedding moment"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
