/**
 * SequenceDemo Composition
 *
 * Demonstrates the Sequence component for timing:
 * - Basic sequence timing
 * - Nested sequences
 * - Overlapping sequences
 * - Series (sequential timing helper)
 * - Layout options
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  Series,
  Easing,
} from "remotion";
import React from "react";

// ============================================
// ANIMATED COMPONENTS
// ============================================

/**
 * Animated Card Component
 * Slides in and fades in when its sequence starts
 */
const AnimatedCard: React.FC<{
  title: string;
  description: string;
  color: string;
  icon: string;
}> = ({ title, description, color, icon }) => {
  const frame = useCurrentFrame();

  // These animations are relative to the Sequence start
  // frame will be 0 when the sequence begins
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(frame, [0, 25], [-100, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const scale = interpolate(frame, [0, 25], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <div
      style={{
        backgroundColor: color,
        padding: "40px 60px",
        borderRadius: 20,
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        boxShadow: `0 20px 60px ${color}40`,
        minWidth: 400,
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 15 }}>{icon}</div>
      <h2
        style={{
          color: "white",
          fontSize: 36,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 20,
          fontFamily: "system-ui, sans-serif",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
};

/**
 * Progress Bar Component
 * Shows the overall progress through the video
 */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = (frame / durationInFrames) * 100;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 100,
        right: 100,
      }}
    >
      <div
        style={{
          height: 8,
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "#4ECDC4",
            borderRadius: 4,
            transition: "none",
          }}
        />
      </div>
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          fontFamily: "monospace",
          marginTop: 10,
          textAlign: "center",
        }}
      >
        Frame {frame} / {durationInFrames} ({progress.toFixed(1)}%)
      </p>
    </div>
  );
};

/**
 * Scene Indicator
 * Shows which scene is currently active
 */
const SceneIndicator: React.FC<{ scenes: string[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();

  // Each scene is 75 frames long
  const sceneLength = 75;
  const currentSceneIndex = Math.min(
    Math.floor(frame / sceneLength),
    scenes.length - 1
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 60,
        display: "flex",
        gap: 10,
      }}
    >
      {scenes.map((scene, index) => (
        <div
          key={scene}
          style={{
            padding: "8px 16px",
            backgroundColor:
              index === currentSceneIndex
                ? "#4ECDC4"
                : "rgba(255,255,255,0.1)",
            borderRadius: 20,
            color:
              index === currentSceneIndex
                ? "#000"
                : "rgba(255,255,255,0.5)",
            fontSize: 14,
            fontFamily: "system-ui, sans-serif",
            fontWeight: index === currentSceneIndex ? 600 : 400,
          }}
        >
          {scene}
        </div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const SequenceDemo: React.FC = () => {
  const scenes = ["Intro", "Features", "Series", "Overlap"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
      }}
    >
      {/* Scene indicators */}
      <SceneIndicator scenes={scenes} />

      {/* Progress bar */}
      <ProgressBar />

      {/* Title */}
      <Sequence from={0} durationInFrames={300}>
        <h1
          style={{
            position: "absolute",
            top: 30,
            left: 60,
            color: "white",
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Sequence Timing
        </h1>
      </Sequence>

      {/* ============================================
          SCENE 1: INTRO (frames 0-74)
          Basic Sequence demonstration
          ============================================ */}
      <Sequence from={0} durationInFrames={75} name="Scene: Intro">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Staggered card appearances */}
          <div style={{ display: "flex", gap: 30 }}>
            <Sequence from={0}>
              <AnimatedCard
                title="Sequence"
                description="Controls when elements appear"
                color="#FF6B6B"
                icon="⏱️"
              />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ============================================
          SCENE 2: FEATURES (frames 75-149)
          Nested and staggered sequences
          ============================================ */}
      <Sequence from={75} durationInFrames={75} name="Scene: Features">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 30, flexDirection: "column" }}>
            {/* Staggered sequence - each card appears 15 frames after previous */}
            <Sequence from={0}>
              <AnimatedCard
                title="Staggered Timing"
                description="Cards appear one after another"
                color="#4ECDC4"
                icon="📊"
              />
            </Sequence>
            <Sequence from={15}>
              <AnimatedCard
                title="Nested Sequences"
                description="Sequences can contain sequences"
                color="#45B7D1"
                icon="🎯"
              />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ============================================
          SCENE 3: SERIES (frames 150-224)
          Using Series for sequential timing
          ============================================ */}
      <Sequence from={150} durationInFrames={75} name="Scene: Series">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/**
           * Series Component
           *
           * Automatically places children one after another
           * No need to calculate 'from' values manually
           * Each child plays for its specified durationInFrames
           */}
          <Series>
            <Series.Sequence durationInFrames={25}>
              <AbsoluteFill
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <AnimatedCard
                  title="First"
                  description="Series plays items sequentially"
                  color="#FF6B6B"
                  icon="1️⃣"
                />
              </AbsoluteFill>
            </Series.Sequence>

            <Series.Sequence durationInFrames={25}>
              <AbsoluteFill
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <AnimatedCard
                  title="Second"
                  description="Automatically follows the first"
                  color="#4ECDC4"
                  icon="2️⃣"
                />
              </AbsoluteFill>
            </Series.Sequence>

            <Series.Sequence durationInFrames={25}>
              <AbsoluteFill
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <AnimatedCard
                  title="Third"
                  description="No manual timing needed!"
                  color="#FFE66D"
                  icon="3️⃣"
                />
              </AbsoluteFill>
            </Series.Sequence>
          </Series>
        </AbsoluteFill>
      </Sequence>

      {/* ============================================
          SCENE 4: OVERLAPPING (frames 225-299)
          Overlapping sequences
          ============================================ */}
      <Sequence from={225} durationInFrames={75} name="Scene: Overlapping">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* These sequences overlap - they're both visible at the same time */}
          <Sequence from={0}>
            <div style={{ position: "absolute", left: 100 }}>
              <AnimatedCard
                title="Overlap A"
                description="Starts at frame 0"
                color="#9B59B6"
                icon="🅰️"
              />
            </div>
          </Sequence>

          <Sequence from={10}>
            <div style={{ position: "absolute", right: 100 }}>
              <AnimatedCard
                title="Overlap B"
                description="Starts at frame 10"
                color="#E74C3C"
                icon="🅱️"
              />
            </div>
          </Sequence>

          <Sequence from={20}>
            <div style={{ position: "absolute", top: "60%" }}>
              <AnimatedCard
                title="Overlap C"
                description="All three visible together!"
                color="#F39C12"
                icon="©️"
              />
            </div>
          </Sequence>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
