"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

const MAX_PHOTOS = 10;
const STORAGE_KEY = "wedding_photos_used";

function getPhotosUsed(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

function setPhotosUsed(n: number) {
  localStorage.setItem(STORAGE_KEY, String(n));
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function Home() {
  const [photosUsed, setPhotosUsedState] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotosUsedState(getPhotosUsed());
  }, []);

  const photosLeft = MAX_PHOTOS - photosUsed;
  const isExhausted = photosLeft <= 0;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      return;
    }
    setErrorMsg("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || isExhausted) return;
    setUploadState("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const newCount = photosUsed + 1;
      setPhotosUsed(newCount);
      setPhotosUsedState(newCount);
      setUploadState("success");
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setUploadState("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTakeAnother = () => {
    setUploadState("idle");
    setPreview(null);
    setSelectedFile(null);
    setErrorMsg("");
  };

  const filmStrip = Array.from({ length: MAX_PHOTOS }, (_, i) => i < photosUsed);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10 fade-up">
        <p className="font-display italic text-sm tracking-[0.3em] text-[var(--mid)] mb-3 uppercase">
          You are cordially invited
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-light text-[var(--dark)] leading-tight">
          Sara & Ahmed
        </h1>
        <div className="gold-divider my-5" />
        <p className="font-display italic text-xl text-[var(--mid)]">
          June 14, 2026
        </p>
      </div>

      {/* Film strip counter */}
      <div className="fade-up-delay-1 mb-10 flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {filmStrip.map((used, i) => (
            <div
              key={i}
              className="w-6 h-8 border transition-all duration-500"
              style={{
                borderColor: used ? "var(--gold)" : "var(--mid)",
                backgroundColor: used ? "var(--gold)" : "transparent",
                opacity: used ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <p className="text-xs tracking-[0.25em] uppercase text-[var(--mid)]">
          {isExhausted
            ? "All frames used"
            : `${photosLeft} frame${photosLeft !== 1 ? "s" : ""} remaining`}
        </p>
      </div>

      {/* Main card */}
      <div className="fade-up-delay-2 w-full max-w-md">
        {isExhausted ? (
          <ExhaustedState />
        ) : uploadState === "success" ? (
          <SuccessState photosLeft={MAX_PHOTOS - photosUsed} onTakeAnother={handleTakeAnother} />
        ) : preview ? (
          <PreviewState
            preview={preview}
            uploading={uploadState === "uploading"}
            error={errorMsg}
            onUpload={handleUpload}
            onCancel={handleCancel}
          />
        ) : (
          <IdleState
            photosLeft={photosLeft}
            onSelect={() => fileInputRef.current?.click()}
            isFirstPhoto={photosUsed === 0}
          />
        )}
      </div>

      {/* Hidden file input */}
      {/* @ts-ignore -- JSX.IntrinsicElements error in some TS configs; suppress for file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Gallery link */}
      <div className="fade-up-delay-4 mt-12 text-center">
        <div className="gold-divider mb-6" />
        <Link
          href="/gallery"
          className="font-display italic text-[var(--mid)] hover:text-[var(--dark)] transition-colors text-sm tracking-widest"
        >
          View the Gallery →
        </Link>
      </div>
    </main>
  );
}

function IdleState({
  photosLeft,
  onSelect,
  isFirstPhoto,
}: {
  photosLeft: number;
  onSelect: () => void;
  isFirstPhoto: boolean;
}) {
  return (
    <div className="text-center">
      {isFirstPhoto && (
        <div className="mb-8 px-6 py-6 border border-[var(--gold)] border-opacity-40 bg-[var(--warm-white)]">
          <p className="font-display italic text-2xl text-[var(--dark)] leading-relaxed mb-3">
            "You have only {photosLeft} photos."
          </p>
          <p className="font-display italic text-lg text-[var(--mid)] leading-relaxed">
            Use them wisely.
          </p>
          <div className="gold-divider mt-4" />
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--mid)] mt-4">
            Like a disposable camera — every frame counts.
          </p>
        </div>
      )}

      <label
        htmlFor="camera-input"
        className="group relative w-full py-5 px-8 border border-[var(--dark)] bg-transparent hover:bg-[var(--dark)] transition-all duration-500 text-[var(--dark)] hover:text-[var(--cream)] tracking-[0.2em] uppercase text-sm font-light cursor-pointer block"
      >
        {isFirstPhoto ? "Take Your First Photo" : "Take a Photo"}
      </label>

      {!isFirstPhoto && (
        <p className="mt-4 text-xs tracking-widest text-[var(--mid)] uppercase">
          {photosLeft} frames left
        </p>
      )}
    </div>
  );
}

      <button
        onClick={onSelect}
        className="group relative w-full py-5 px-8 border border-[var(--dark)] bg-transparent hover:bg-[var(--dark)] transition-all duration-500 text-[var(--dark)] hover:text-[var(--cream)] tracking-[0.2em] uppercase text-sm font-light"
      >
        <span className="relative z-10">
          {isFirstPhoto ? "Take Your First Photo" : "Take a Photo"}
        </span>
      </button>

      {!isFirstPhoto && (
        <p className="mt-4 text-xs tracking-widest text-[var(--mid)] uppercase">
          {photosLeft} frames left
        </p>
      )}
    </div>
  );
}

function PreviewState({
  preview,
  uploading,
  error,
  onUpload,
  onCancel,
}: {
  preview: string;
  uploading: boolean;
  error: string;
  onUpload: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="film-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Preview"
          className="w-full aspect-square object-cover block"
        />
      </div>

      {error && (
        <p className="text-center text-xs text-red-500 tracking-wide">{error}</p>
      )}

      <button
        onClick={onUpload}
        disabled={uploading}
        className="w-full py-4 px-8 bg-[var(--dark)] text-[var(--cream)] tracking-[0.2em] uppercase text-sm font-light disabled:opacity-50 transition-opacity"
      >
        {uploading ? "Developing…" : "Use This Frame"}
      </button>
      <button
        onClick={onCancel}
        disabled={uploading}
        className="w-full py-3 px-8 border border-[var(--mid)] text-[var(--mid)] tracking-[0.2em] uppercase text-xs font-light hover:border-[var(--dark)] hover:text-[var(--dark)] transition-colors disabled:opacity-30"
      >
        Retake
      </button>
    </div>
  );
}

function SuccessState({
  photosLeft,
  onTakeAnother,
}: {
  photosLeft: number;
  onTakeAnother: () => void;
}) {
  return (
    <div className="text-center py-6">
      <div className="text-4xl mb-5">✦</div>
      <p className="font-display italic text-2xl text-[var(--dark)] mb-2">
        Captured.
      </p>
      <p className="text-sm tracking-widest text-[var(--mid)] uppercase mb-8">
        {photosLeft > 0
          ? `${photosLeft} frame${photosLeft !== 1 ? "s" : ""} remaining`
          : "All frames used"}
      </p>
      {photosLeft > 0 && (
        <button
          onClick={onTakeAnother}
          className="w-full py-4 px-8 border border-[var(--dark)] text-[var(--dark)] tracking-[0.2em] uppercase text-sm font-light hover:bg-[var(--dark)] hover:text-[var(--cream)] transition-all duration-500"
        >
          Take Another
        </button>
      )}
    </div>
  );
}

function ExhaustedState() {
  return (
    <div className="text-center px-6 py-10 border border-[var(--gold)] border-opacity-40 bg-[var(--warm-white)]">
      <div className="text-3xl mb-5">✦</div>
      <p className="font-display italic text-2xl text-[var(--dark)] leading-relaxed mb-3">
        Your roll is finished.
      </p>
      <p className="font-display italic text-[var(--mid)] leading-relaxed">
        Thank you for capturing these moments with us.
      </p>
      <div className="gold-divider mt-6 mb-6" />
      <Link
        href="/gallery"
        className="inline-block border border-[var(--dark)] text-[var(--dark)] py-3 px-8 tracking-[0.2em] uppercase text-sm font-light hover:bg-[var(--dark)] hover:text-[var(--cream)] transition-all duration-500"
      >
        View the Gallery
      </Link>
    </div>
  );
}
