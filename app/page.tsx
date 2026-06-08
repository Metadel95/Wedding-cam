"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

const MAX_PHOTOS = 10;
const STORAGE_KEY = "wedding_photos_used_v2";

function getPhotosUsed(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

type Stage = "welcome" | "camera" | "preview" | "uploading" | "success" | "done";

export default function Home() {
  const [photosUsed, setPhotosUsedState] = useState(0);
  const [stage, setStage] = useState<Stage>("welcome");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const used = getPhotosUsed();
    setPhotosUsedState(used);
    if (used >= MAX_PHOTOS) setStage("done");
    else setStage("camera");
  }, []);

  const photosLeft = MAX_PHOTOS - photosUsed;

  const triggerCamera = () => {
    setErrorMsg("");
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
      setStage("preview");
    };
    reader.readAsDataURL(file);
    // reset so same file can be reselected
    e.target.value = "";
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStage("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const newCount = photosUsed + 1;
      localStorage.setItem(STORAGE_KEY, String(newCount));
      setPhotosUsedState(newCount);

      // Flash effect
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 600);

      if (newCount >= MAX_PHOTOS) {
        setTimeout(() => setStage("done"), 700);
      } else {
        setStage("success");
      }
      setPreview(null);
      setSelectedFile(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong!");
      setStage("preview");
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setSelectedFile(null);
    setStage("camera");
    setErrorMsg("");
  };

  const handleNext = () => {
    setStage("camera");
    setErrorMsg("");
  };

  return (
    <div className="relative min-h-screen flex flex-col" style={{ position: "relative", zIndex: 1 }}>
      {showFlash && <div className="flash-overlay" />}

      {/* Hidden file input — NO capture attribute for max compatibility */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        onChange={handleFileChange}
      />

      {stage === "welcome" && <WelcomeScreen onStart={() => setStage("camera")} />}
      {stage === "camera" && (
        <CameraScreen
          photosLeft={photosLeft}
          photosUsed={photosUsed}
          onCapture={triggerCamera}
          error={errorMsg}
        />
      )}
      {stage === "preview" && preview && (
        <PreviewScreen
          preview={preview}
          onConfirm={handleUpload}
          onRetake={handleRetake}
          photosLeft={photosLeft}
        />
      )}
      {stage === "uploading" && (
        <UploadingScreen />
      )}
      {stage === "success" && (
        <SuccessScreen
          photosLeft={photosLeft}
          onNext={handleNext}
        />
      )}
      {stage === "done" && <DoneScreen />}
    </div>
  );
}

/* ─── WELCOME ─── */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-12 text-center">
      <div />
      <div className="slide-up">
        {/* Floating emojis */}
        <div className="relative mb-8">
          <span className="text-6xl block float">📸</span>
          <span className="absolute -top-2 -right-6 text-3xl float-delay">💍</span>
          <span className="absolute -bottom-2 -left-8 text-2xl float">🌸</span>
        </div>

        <h1 className="font-fun text-4xl mb-2" style={{ color: "var(--pink)" }}>
          Sara & Ahmed
        </h1>
        <p className="text-lg mb-1" style={{ color: "var(--yellow)" }}>are getting married! 🎊</p>
        <p className="text-sm opacity-60 mb-10">June 14, 2026</p>

        <div
          className="rounded-2xl p-5 mb-10"
          style={{ background: "var(--card)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-3xl mb-3">🎞️</p>
          <p className="font-semibold text-lg mb-2">You get</p>
          <p className="font-fun text-5xl mb-2" style={{ color: "var(--yellow)" }}>10 shots</p>
          <p className="opacity-60 text-sm leading-relaxed">
            Like a disposable camera.<br />Use them wisely. Make them count!
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="slide-up-3 w-full max-w-xs py-5 rounded-2xl font-semibold text-lg text-white"
        style={{ background: "linear-gradient(135deg, var(--pink), var(--coral))" }}
      >
        Let&apos;s Go! 🎉
      </button>
    </div>
  );
}

/* ─── CAMERA ─── */
function CameraScreen({
  photosLeft,
  photosUsed,
  onCapture,
  error,
}: {
  photosLeft: number;
  photosUsed: number;
  onCapture: () => void;
  error: string;
}) {
  const dots = Array.from({ length: MAX_PHOTOS }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-10">
      {/* Top bar */}
      <div className="w-full slide-up">
        <div className="flex justify-between items-center mb-6">
          <Link href="/gallery" className="text-xs opacity-50 tracking-widest uppercase">
            Gallery →
          </Link>
          <span
            className="font-fun text-base"
            style={{ color: photosLeft <= 3 ? "var(--coral)" : "var(--yellow)" }}
          >
            {photosLeft} left
          </span>
        </div>

        {/* Film dots */}
        <div className="flex gap-2 justify-center flex-wrap mb-2">
          {dots.map((i) => {
            const used = i < photosUsed;
            return (
              <div
                key={i}
                className="film-dot"
                style={{
                  borderColor: used ? "var(--pink)" : "rgba(255,255,255,0.2)",
                  background: used ? "var(--pink)" : "transparent",
                  color: used ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                {used ? "✓" : ""}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs opacity-40 mb-8 tracking-widest uppercase">
          {photosUsed}/{MAX_PHOTOS} frames used
        </p>
      </div>

      {/* Center message */}
      <div className="text-center slide-up-1">
        <p className="text-5xl mb-4 float">🤳</p>
        <p className="font-semibold text-xl mb-2">Capture the moment!</p>
        <p className="text-sm opacity-50">
          Something silly, sweet, or spontaneous 🥂
        </p>
        {error && (
          <p className="mt-4 text-sm py-2 px-4 rounded-lg" style={{ color: "var(--coral)", background: "rgba(255,139,100,0.1)" }}>
            {error}
          </p>
        )}
      </div>

      {/* Camera button */}
      <div className="flex flex-col items-center gap-5 slide-up-2">
        <button
          onClick={onCapture}
          className="camera-btn"
          aria-label="Take photo"
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <p className="text-xs opacity-30 tracking-widest uppercase">tap to capture</p>
      </div>
    </div>
  );
}

/* ─── PREVIEW ─── */
function PreviewScreen({
  preview,
  onConfirm,
  onRetake,
  photosLeft,
}: {
  preview: string;
  onConfirm: () => void;
  onRetake: () => void;
  photosLeft: number;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Photo preview fills top */}
      <div className="relative flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Preview" className="w-full h-full object-cover" style={{ maxHeight: "65vh" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, var(--dark))" }} />
        <div className="absolute top-4 left-4">
          <span
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background: "rgba(0,0,0,0.6)", color: "var(--yellow)" }}
          >
            {photosLeft - 1} shots left after this
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-8 flex flex-col gap-4 slide-up">
        <p className="text-center font-semibold text-lg">Looking good? 👀</p>
        <button
          onClick={onConfirm}
          className="w-full py-5 rounded-2xl font-semibold text-lg text-white"
          style={{ background: "linear-gradient(135deg, var(--pink), var(--coral))" }}
        >
          Use this shot! 📸
        </button>
        <button
          onClick={onRetake}
          className="w-full py-4 rounded-2xl font-semibold text-base opacity-60"
          style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }}
        >
          Retake
        </button>
      </div>
    </div>
  );
}

/* ─── UPLOADING ─── */
function UploadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-6xl" style={{ animation: "spin-slow 2s linear infinite" }}>⚙️</div>
      <p className="font-fun text-2xl" style={{ color: "var(--pink)" }}>Developing…</p>
      <p className="text-sm opacity-50">Your photo is being saved!</p>
    </div>
  );
}

/* ─── SUCCESS ─── */
function SuccessScreen({ photosLeft, onNext }: { photosLeft: number; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-16 text-center">
      <div />
      <div className="pop">
        <p className="text-7xl mb-6">🎉</p>
        <h2 className="font-fun text-3xl mb-3" style={{ color: "var(--mint)" }}>
          Shot saved!
        </h2>
        <p className="opacity-60 mb-2">It&apos;s in the gallery now 🖼️</p>
        <p className="font-fun text-lg" style={{ color: "var(--yellow)" }}>
          {photosLeft} frame{photosLeft !== 1 ? "s" : ""} left
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <button
          onClick={onNext}
          className="w-full py-5 rounded-2xl font-semibold text-lg text-white"
          style={{ background: "linear-gradient(135deg, var(--pink), var(--coral))" }}
        >
          Take Another! 📸
        </button>
        <Link
          href="/gallery"
          className="block w-full py-4 rounded-2xl font-semibold text-center opacity-60"
          style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }}
        >
          See Gallery
        </Link>
      </div>
    </div>
  );
}

/* ─── DONE ─── */
function DoneScreen() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-16 text-center">
      <div />
      <div className="pop">
        <p className="text-7xl mb-6">🎞️</p>
        <h2 className="font-fun text-3xl mb-4" style={{ color: "var(--yellow)" }}>
          Roll&apos;s finished!
        </h2>
        <p className="opacity-70 text-base leading-relaxed mb-4">
          You&apos;ve used all 10 frames.<br />
          Thanks for capturing the magic! ✨
        </p>
        <p className="font-fun text-lg" style={{ color: "var(--pink)" }}>
          Sara & Ahmed 💍
        </p>
      </div>
      <Link
        href="/gallery"
        className="block w-full max-w-xs py-5 rounded-2xl font-semibold text-lg text-white text-center"
        style={{ background: "linear-gradient(135deg, var(--purple), var(--sky))" }}
      >
        See All Photos 🖼️
      </Link>
    </div>
  );
}
