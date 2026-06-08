"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

const MAX_PHOTOS = 10;
const STORAGE_KEY = "weddingcam_v3";

function getUsed(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

type Stage = "camera" | "preview" | "uploading" | "success" | "done";

export default function Home() {
  const [used, setUsed]       = useState(0);
  const [stage, setStage]     = useState<Stage>("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile]       = useState<File | null>(null);
  const fileRef = useRef<File | null>(null);
  const [error, setError]     = useState("");
  const [flash, setFlash]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const n = getUsed();
    setUsed(n);
    if (n >= MAX_PHOTOS) setStage("done");
  }, []);

  const left = MAX_PHOTOS - used;

  /* File picked — show preview */
  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    // Read the data URL first, then store file and clear input
    const reader = new FileReader();
    reader.onload = ev => {
      fileRef.current = f;
      setFile(f);
      setPreview(ev.target?.result as string);
      setStage("preview");
      // Clear input AFTER we've captured everything we need
      e.target.value = "";
    };
    reader.readAsDataURL(f);
  }, []);

  /* Upload */
  const onSend = async () => {
    const currentFile = fileRef.current || file;
    if (!currentFile) return;
    setStage("uploading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", currentFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error || "Upload failed");

      const newUsed = used + 1;
      localStorage.setItem(STORAGE_KEY, String(newUsed));
      setUsed(newUsed);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
      setPreview(null);
      setFile(null);
      fileRef.current = null;
      setStage(newUsed >= MAX_PHOTOS ? "done" : "success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("preview");
    }
  };

  const onRetake = () => { setPreview(null); setFile(null); fileRef.current = null; setStage("camera"); setError(""); };
  const onAnother = () => { setStage("camera"); setError(""); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {flash && <div className="flash-overlay" />}

      {/* The input — no capture attr, id wired to labels */}
      <input
        id="photo-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        style={{ position: "fixed", bottom: 0, left: 0, width: "1px", height: "1px", opacity: 0 }}
        tabIndex={-1}
      />

      {stage === "camera"   && <CameraScreen   used={used} left={left} error={error} />}
      {stage === "preview"  && preview && <PreviewScreen preview={preview} left={left} onSend={onSend} onRetake={onRetake} error={error} />}
      {stage === "uploading" && <UploadScreen />}
      {stage === "success"  && <SuccessScreen  left={left} onAnother={onAnother} />}
      {stage === "done"     && <DoneScreen />}
    </div>
  );
}

/* ══════════════════════════════════════════
   CAMERA SCREEN — opens directly on load
══════════════════════════════════════════ */
function CameraScreen({ used, left, error }: { used: number; left: number; error: string }) {
  const low = left <= 3;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 24px", minHeight: "100vh" }}>

      {/* Top bar */}
      <div className="animate-fade" style={{ paddingTop: "28px", paddingBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,240,232,0.35)", marginBottom: 2 }}>
            Sara & Ahmed
          </p>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(245,240,232,0.2)" }}>
            14 June 2026
          </p>
        </div>
        <Link href="/gallery" style={{ fontSize: 13, color: "rgba(245,240,232,0.4)", textDecoration: "none", fontWeight: 500 }}>
          Gallery
        </Link>
      </div>

      {/* Film strip */}
      <div className="animate-fade-1" style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div className="film-strip">
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
            <div
              key={i}
              className="film-frame-dot"
              style={{
                background: i < used ? "#F5F0E8" : "rgba(245,240,232,0.12)",
                transform: i < used ? "scaleY(1.3)" : "scaleY(1)",
              }}
            />
          ))}
        </div>
        <p style={{
          fontSize: 12, fontWeight: 500, letterSpacing: "0.08em",
          color: low ? "#E8845A" : "rgba(245,240,232,0.3)",
          textTransform: "uppercase"
        }}>
          {left} {low ? "left — use wisely" : `of ${MAX_PHOTOS} remaining`}
        </p>
      </div>

      {/* Middle text */}
      <div className="animate-fade-2" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 12 }}>
        <p className="serif" style={{ fontSize: 32, lineHeight: 1.25, color: "#F5F0E8", fontStyle: "italic" }}>
          Capture the<br />moment.
        </p>
        <p style={{ fontSize: 14, color: "rgba(245,240,232,0.35)", lineHeight: 1.6, maxWidth: 220 }}>
          You have {MAX_PHOTOS} shots. Like a disposable camera — make every one count.
        </p>
        {error && (
          <p style={{ fontSize: 13, color: "#E8845A", marginTop: 8 }}>{error}</p>
        )}
      </div>

      {/* Shutter — label directly wired to input, no JS needed */}
      <div className="animate-fade-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 40px, 52px)" }}>
        <div className="shutter-wrap">
          <div className="shutter-ring" />
          <label htmlFor="photo-input" className="shutter-btn" aria-label="Take or choose a photo">
            <div className="shutter-inner">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </label>
        </div>
        <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,240,232,0.2)" }}>
          tap to capture
        </p>
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════
   PREVIEW SCREEN
══════════════════════════════════════════ */
function PreviewScreen({ preview, left, onSend, onRetake, error }: {
  preview: string; left: number; onSend: () => void; onRetake: () => void; error: string;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Full photo */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, transparent 30%, transparent 55%, rgba(13,13,13,0.95) 100%)" }} />
        <div style={{ position: "absolute", top: "env(safe-area-inset-top, 20px)", left: 20, marginTop: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(13,13,13,0.65)", backdropFilter: "blur(8px)", color: "rgba(245,240,232,0.7)", letterSpacing: "0.06em" }}>
            {left - 1} shots left after this
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="animate-slide" style={{ padding: "28px 24px", paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 28px, 40px)", display: "flex", flexDirection: "column", gap: 12 }}>
        <p className="serif" style={{ textAlign: "center", fontSize: 22, fontStyle: "italic", marginBottom: 4 }}>Use this shot?</p>
        {error && <p style={{ textAlign: "center", fontSize: 13, color: "#E8845A" }}>{error}</p>}
        <button className="btn-primary" onClick={onSend}>Save it ✓</button>
        <button className="btn-ghost" onClick={onRetake}>Retake</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   UPLOADING
══════════════════════════════════════════ */
function UploadScreen() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, minHeight: "100vh" }}>
      <div className="spinner" />
      <p className="serif" style={{ fontSize: 22, fontStyle: "italic", color: "rgba(245,240,232,0.6)" }}>Saving…</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   SUCCESS
══════════════════════════════════════════ */
function SuccessScreen({ left, onAnother }: { left: number; onAnother: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "0 24px", minHeight: "100vh", textAlign: "center" }}>
      <div />
      <div className="animate-scale" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="serif" style={{ fontSize: 30, lineHeight: 1.2 }}>Saved!</p>
        <p style={{ fontSize: 14, color: "rgba(245,240,232,0.4)" }}>It's in the gallery now.</p>
        <div className="card" style={{ marginTop: 16, padding: "14px 28px" }}>
          <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", marginBottom: 2 }}>Remaining</p>
          <p style={{ fontSize: 28, fontWeight: 600 }}>{left} <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(245,240,232,0.4)" }}>of {MAX_PHOTOS}</span></p>
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 28px, 40px)" }}>
        <button className="btn-primary" onClick={onAnother}>Take another</button>
        <Link href="/gallery" style={{ display: "block", textDecoration: "none" }}>
          <button className="btn-ghost" style={{ width: "100%" }}>View gallery</button>
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DONE — all 10 used
══════════════════════════════════════════ */
function DoneScreen() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "0 24px", minHeight: "100vh", textAlign: "center" }}>
      <div />
      <div className="animate-scale" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div className="film-strip" style={{ marginBottom: 8 }}>
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
            <div key={i} className="film-frame-dot" style={{ background: "#F5F0E8", transform: "scaleY(1.3)" }} />
          ))}
        </div>
        <p className="serif" style={{ fontSize: 32, lineHeight: 1.2, fontStyle: "italic" }}>Roll complete.</p>
        <p style={{ fontSize: 15, color: "rgba(245,240,232,0.4)", lineHeight: 1.7, maxWidth: 240 }}>
          You've used all {MAX_PHOTOS} frames. Thank you for capturing our day.
        </p>
        <p className="serif" style={{ fontSize: 18, marginTop: 8 }}>Sara & Ahmed 💍</p>
      </div>
      <Link href="/gallery" style={{ display: "block", width: "100%", textDecoration: "none", paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 28px, 40px)" }}>
        <button className="btn-primary">See all the moments →</button>
      </Link>
    </div>
  );
}
