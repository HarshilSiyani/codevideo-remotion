"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Play, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Redirect to create page with prompt
    window.location.href = `/create?prompt=${encodeURIComponent(prompt)}`;
  };

  const examples = [
    "Explain why the sky is blue in 30 seconds",
    "Create an intro for my gaming channel 'NightOwl'",
    "5 tips for better sleep - quick and punchy",
    "Product launch teaser for a new fitness app",
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-vizmo-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-vizmo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-12"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vizmo-400 to-purple-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Vizmo</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              Create stunning videos
              <br />
              <span className="gradient-text">in seconds</span>
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Describe your video and watch AI bring it to life with motion
              graphics, kinetic typography, and professional effects.
            </p>
          </motion.div>

          {/* Main Input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleGenerate}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video..."
                className="w-full px-6 py-4 pr-32 bg-dark-800 border border-dark-600 rounded-2xl text-lg focus:outline-none focus:border-vizmo-500 focus:ring-2 focus:ring-vizmo-500/20 transition-all"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-vizmo-500 to-purple-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-vizmo-500/25 transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Example prompts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-16"
          >
            <p className="text-sm text-dark-400 mb-3">Try an example:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-full text-sm text-dark-300 hover:text-white transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="Get your video in under 60 seconds. No editing skills required."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI-Powered"
              description="Advanced AI creates professional motion graphics automatically."
            />
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="Ready to Share"
              description="Export in any format. Perfect for TikTok, Reels, or YouTube."
            />
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-dark-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-dark-400 mb-8">
            Trusted by creators, marketers, and educators
          </p>
          <div className="flex justify-center items-center gap-12 opacity-50">
            {/* Placeholder logos */}
            <div className="text-2xl font-bold text-dark-500">YourBrand</div>
            <div className="text-2xl font-bold text-dark-500">CreatorCo</div>
            <div className="text-2xl font-bold text-dark-500">MediaHub</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to create your first video?
          </h2>
          <p className="text-xl text-dark-300 mb-8">
            No credit card required. Start creating for free.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-vizmo-500 to-purple-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-vizmo-500/25 transition-all"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-dark-800">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vizmo-400 to-purple-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Vizmo</span>
          </div>
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} Vizmo. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-dark-800/50 border border-dark-700 rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vizmo-500/20 to-purple-500/20 flex items-center justify-center text-vizmo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-dark-400">{description}</p>
    </div>
  );
}
