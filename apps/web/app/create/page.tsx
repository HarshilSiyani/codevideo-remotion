"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sparkles,
  Download,
  RefreshCw,
  Share2,
  Check,
  ArrowLeft,
  Zap,
  Play,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { VideoConfig } from "@vizmo/remotion/src/compositions/DynamicVideo";

// Dynamically import VideoPlayer to avoid SSR issues with Remotion
const VideoPlayer = dynamic(
  () => import("../../components/VideoPlayer").then((mod) => mod.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-dark-800 rounded-2xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vizmo-500" />
      </div>
    ),
  }
);

type GenerationStep = "idle" | "script" | "config" | "voiceover" | "preview" | "rendering" | "complete" | "error";

interface GenerationState {
  step: GenerationStep;
  script?: {
    title: string;
    voiceoverScript: string;
    duration: number;
    hook?: string;
    mainPoints?: string[];
    conclusion?: string;
  };
  videoConfig?: VideoConfig;
  videoUrl?: string;
  error?: string;
}

function CreatePageContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [state, setState] = useState<GenerationState>({ step: "idle" });

  useEffect(() => {
    if (initialPrompt && state.step === "idle") {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState({ step: "script" });

    try {
      // Step 1: Generate script
      const scriptRes = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!scriptRes.ok) {
        throw new Error("Failed to generate script");
      }

      const script = await scriptRes.json();
      setState({ step: "config", script });

      // Step 2: Generate video config
      const configRes = await fetch("/api/generate/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      if (!configRes.ok) {
        throw new Error("Failed to generate video configuration");
      }

      const videoConfig = await configRes.json();

      // Step 3: Show preview (video is playable in browser via Remotion Player)
      setState((prev) => ({ ...prev, step: "preview", videoConfig }));

    } catch (error) {
      setState({
        step: "error",
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const handleRender = async () => {
    if (!state.videoConfig) return;

    setState((prev) => ({ ...prev, step: "rendering" }));

    try {
      // Call render API to generate downloadable video
      const renderRes = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: state.videoConfig }),
      });

      if (!renderRes.ok) {
        throw new Error("Failed to render video");
      }

      const { videoUrl } = await renderRes.json();
      setState((prev) => ({ ...prev, step: "complete", videoUrl }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step: "error",
        error: error instanceof Error ? error.message : "Rendering failed",
      }));
    }
  };

  const handleNewVideo = () => {
    setPrompt("");
    setState({ step: "idle" });
  };

  return (
    <main className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vizmo-400 to-purple-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Vizmo</span>
          </Link>

          {state.step === "complete" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewVideo}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                New Video
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Idle / Input State */}
          {state.step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">
                What video do you want to create?
              </h1>
              <p className="text-dark-400 mb-8">
                Describe your video and AI will create it for you
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
                className="max-w-2xl mx-auto"
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a 30-second explainer about how solar panels work..."
                  className="w-full h-32 px-6 py-4 bg-dark-800 border border-dark-600 rounded-2xl text-lg resize-none focus:outline-none focus:border-vizmo-500 focus:ring-2 focus:ring-vizmo-500/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-vizmo-500 to-purple-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-vizmo-500/25 transition-all flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Video
                </button>
              </form>
            </motion.div>
          )}

          {/* Generating State */}
          {(state.step === "script" || state.step === "config") && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vizmo-500 to-purple-500 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>

              <h2 className="text-2xl font-bold mb-4">
                Creating your video...
              </h2>

              <div className="max-w-md mx-auto space-y-4">
                <StepIndicator
                  label="Generating script"
                  status={
                    state.step === "script"
                      ? "active"
                      : "complete"
                  }
                />
                <StepIndicator
                  label="Creating video configuration"
                  status={
                    state.step === "config"
                      ? "active"
                      : "pending"
                  }
                />
              </div>

              {state.script && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-dark-800 rounded-2xl text-left max-w-2xl mx-auto"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {state.script.title}
                  </h3>
                  <p className="text-dark-400 text-sm">
                    {state.script.voiceoverScript}
                  </p>
                  <p className="text-dark-500 text-xs mt-2">
                    Duration: {state.script.duration} seconds
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Preview State - Video is ready to preview in browser */}
          {state.step === "preview" && state.videoConfig && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-vizmo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-vizmo-500" />
                </div>
                <h2 className="text-2xl font-bold">Preview Your Video</h2>
                <p className="text-dark-400 mt-2">
                  Review your video below. Click render when you are ready to export.
                </p>
              </div>

              {/* Video Preview with Remotion Player */}
              <VideoPlayer config={state.videoConfig} className="mb-8" />

              {/* Script Details */}
              {state.script && (
                <div className="p-4 bg-dark-800/50 rounded-xl mb-6">
                  <h3 className="text-sm font-semibold text-dark-400 mb-2">Script</h3>
                  <p className="text-sm text-dark-300">
                    {state.script.voiceoverScript}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleRender}
                  className="px-8 py-3 bg-gradient-to-r from-vizmo-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-vizmo-500/25 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Render &amp; Download
                </button>
                <button
                  onClick={handleNewVideo}
                  className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Start Over
                </button>
              </div>
            </motion.div>
          )}

          {/* Rendering State */}
          {state.step === "rendering" && (
            <motion.div
              key="rendering"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vizmo-500 to-purple-500 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>

              <h2 className="text-2xl font-bold mb-4">
                Rendering your video...
              </h2>
              <p className="text-dark-400 mb-8">
                This may take a moment. We are generating your final video file.
              </p>

              {/* Preview while rendering */}
              {state.videoConfig && (
                <div className="max-w-2xl mx-auto opacity-75">
                  <VideoPlayer config={state.videoConfig} />
                </div>
              )}
            </motion.div>
          )}

          {/* Complete State */}
          {state.step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Your video is ready!</h2>
              </div>

              {/* Video Preview */}
              {state.videoConfig && (
                <VideoPlayer config={state.videoConfig} className="mb-8" />
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {state.videoUrl && (
                  <a
                    href={state.videoUrl}
                    download
                    className="px-6 py-3 bg-gradient-to-r from-vizmo-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-vizmo-500/25 transition-all flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Video
                  </a>
                )}
                <button
                  onClick={handleNewVideo}
                  className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Create Another
                </button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {state.step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😕</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-dark-400 mb-8">{state.error}</p>
              <button
                onClick={handleNewVideo}
                className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StepIndicator({
  label,
  status,
}: {
  label: string;
  status: "pending" | "active" | "complete";
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          status === "complete"
            ? "bg-green-500"
            : status === "active"
            ? "bg-vizmo-500 animate-pulse"
            : "bg-dark-700"
        }`}
      >
        {status === "complete" ? (
          <Check className="w-4 h-4" />
        ) : status === "active" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-dark-500" />
        )}
      </div>
      <span
        className={`${
          status === "active"
            ? "text-white"
            : status === "complete"
            ? "text-green-500"
            : "text-dark-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-vizmo-500" /></div>}>
      <CreatePageContent />
    </Suspense>
  );
}
