"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Photo { url: string; publicId: string; createdAt: string; }

export default function Gallery() {
  const [photos, setPhotos]   = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/photos")
      .then(r => r.json())
      .then(d => { if (d.photos) setPhotos(d.photos); else setError("Couldn't load photos."); })
      .catch(() => setError("Couldn't load photos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(13,13,13,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link href="/" style={{ fontSize: 13, color: "rgba(245,240,232,0.4)", textDecoration: "none", fontWeight: 500 }}>
          ← Camera
        </Link>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontStyle: "italic" }}>Gallery</p>
        <p style={{ fontSize: 13, color: "rgba(245,240,232,0.3)" }}>{photos.length}</p>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 12px 40px" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
            <div className="spinner" />
            <p style={{ fontSize: 14, color: "rgba(245,240,232,0.3)" }}>Loading…</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontSize: 14, color: "rgba(245,240,232,0.3)" }}>{error}</p>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontStyle: "italic", color: "rgba(245,240,232,0.5)" }}>No photos yet.</p>
            <p style={{ fontSize: 14, color: "rgba(245,240,232,0.25)" }}>Be the first to capture a moment.</p>
            <Link href="/" style={{ marginTop: 16 }}>
              <button className="btn-primary" style={{ width: "auto", padding: "14px 32px" }}>Take a photo →</button>
            </Link>
          </div>
        )}

        {photos.length > 0 && (
          <div style={{ columns: 2, gap: 8 }}>
            {photos.map((photo, i) => (
              <div
                key={photo.publicId}
                onClick={() => setLightbox(photo)}
                style={{
                  marginBottom: 8,
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.05)",
                  animation: `fadeIn 0.4s cubic-bezier(.22,1,.36,1) ${Math.min(i * 0.04, 0.3)}s both`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" loading="lazy" style={{ width: "100%", display: "block" }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(13,13,13,0.97)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "none", color: "#F5F0E8", fontSize: 16,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url} alt=""
            style={{ maxHeight: "88vh", maxWidth: "100%", borderRadius: 12, objectFit: "contain" }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
