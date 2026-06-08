"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Photo {
  url: string;
  publicId: string;
  createdAt: string;
  width: number;
  height: number;
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
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14 fade-up">
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase text-[var(--mid)] hover:text-[var(--dark)] transition-colors block mb-8"
        >
          ← Back to Camera
        </Link>
        <h1 className="font-display text-5xl font-light text-[var(--dark)] mb-4">
          The Gallery
        </h1>
        <div className="gold-divider mb-4" />
        <p className="font-display italic text-[var(--mid)] text-lg">
          Sara & Ahmed — June 14, 2026
        </p>
      </div>

      {loading && (
        <div className="text-center py-20 fade-up">
          <p className="font-display italic text-2xl text-[var(--mid)]">
            Developing your film…
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-[var(--mid)] text-sm tracking-wide">{error}</p>
        </div>
      )}

      {!loading && !error && photos.length === 0 && (
        <div className="text-center py-20 fade-up">
          <p className="font-display italic text-2xl text-[var(--mid)] mb-4">
            No photos yet.
          </p>
          <p className="text-sm tracking-widest text-[var(--mid)] uppercase">
            Be the first to capture a moment.
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="columns-2 md:columns-3 gap-3 fade-up">
          {photos.map((photo) => (
            <div
              key={photo.publicId}
              className="film-frame mb-3 cursor-pointer overflow-hidden group"
              onClick={() => setLightbox(photo)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt="Wedding moment"
                className="w-full block transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {!loading && photos.length > 0 && (
        <p className="text-center mt-12 text-xs tracking-[0.3em] uppercase text-[var(--mid)] fade-up">
          {photos.length} moment{photos.length !== 1 ? "s" : ""} captured
        </p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-[var(--dark)] bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-[var(--cream)] text-2xl tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt="Wedding moment"
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
