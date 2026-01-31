/**
 * TransitionsDemo Composition
 *
 * Demonstrates scene transitions:
 * - Fade transitions
 * - Slide transitions
 * - Wipe transitions
 * - Zoom transitions
 * - Custom transition effects
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  Easing,
} from "remotion";
import React from "react";

// ============================================
// SCENE COMPONENTS
// ============================================

const Scene: React.FC<{
  title: string;
  backgroundColor: string;
  subtitle?: string;
}> = ({ title, backgroundColor, subtitle }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 72,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 28,
            fontFamily: "system-ui",
            marginTop: 20,
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};

// ============================================
// TRANSITION COMPONENTS
// ============================================

/**
 * Fade Transition
 * Simple crossfade between scenes
 */
const FadeTransition: React.FC<{
  children: React.ReactNode;
  direction: "in" | "out";
  durationInFrames?: number;
}> = ({ children, direction, durationInFrames = 20 }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, durationInFrames],
    direction === "in" ? [0, 1] : [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <div style={{ opacity }}>{children}</div>;
};

/**
 * Slide Transition
 * Slides content in from a direction
 */
const SlideTransition: React.FC<{
  children: React.ReactNode;
  direction: "left" | "right" | "up" | "down";
  durationInFrames?: number;
}> = ({ children, direction, durationInFrames = 25 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const getStartPosition = () => {
    switch (direction) {
      case "left":
        return { x: -width, y: 0 };
      case "right":
        return { x: width, y: 0 };
      case "up":
        return { x: 0, y: -height };
      case "down":
        return { x: 0, y: height };
    }
  };

  const start = getStartPosition();

  const x = interpolate(frame, [0, durationInFrames], [start.x, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const y = interpolate(frame, [0, durationInFrames], [start.y, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ transform: `translate(${x}px, ${y}px)` }}>{children}</div>
  );
};

/**
 * Wipe Transition
 * Reveals content with a wipe effect
 */
const WipeTransition: React.FC<{
  children: React.ReactNode;
  direction: "left" | "right" | "up" | "down";
  durationInFrames?: number;
}> = ({ children, direction, durationInFrames = 30 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const getClipPath = () => {
    switch (direction) {
      case "left":
        return `inset(0 ${100 - progress}% 0 0)`;
      case "right":
        return `inset(0 0 0 ${100 - progress}%)`;
      case "up":
        return `inset(0 0 ${100 - progress}% 0)`;
      case "down":
        return `inset(${100 - progress}% 0 0 0)`;
    }
  };

  return <div style={{ clipPath: getClipPath() }}>{children}</div>;
};

/**
 * Zoom Transition
 * Zooms content in or out
 */
const ZoomTransition: React.FC<{
  children: React.ReactNode;
  direction: "in" | "out";
  durationInFrames?: number;
}> = ({ children, direction, durationInFrames = 25 }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    direction === "in" ? [0, 1] : [1, 2],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const opacity = interpolate(
    frame,
    [0, durationInFrames * 0.5],
    direction === "in" ? [0, 1] : [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Circle Reveal Transition
 * Reveals content from the center in a circle
 */
const CircleRevealTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames?: number;
}> = ({ children, durationInFrames = 30 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Calculate max radius needed to cover the entire screen
  const maxRadius = Math.sqrt(
    Math.pow(width / 2, 2) + Math.pow(height / 2, 2)
  );

  const radius = interpolate(frame, [0, durationInFrames], [0, maxRadius], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        clipPath: `circle(${radius}px at center)`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const TransitionsDemo: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Scene 1: Fade In (frames 0-59) */}
      <Sequence from={0} durationInFrames={60} name="Scene 1: Fade">
        <FadeTransition direction="in" durationInFrames={20}>
          <Scene
            title="Fade Transition"
            backgroundColor="#2C3E50"
            subtitle="Simple and elegant"
          />
        </FadeTransition>
      </Sequence>

      {/* Scene 2: Slide from Right (frames 60-119) */}
      <Sequence from={60} durationInFrames={60} name="Scene 2: Slide">
        <SlideTransition direction="right" durationInFrames={25}>
          <Scene
            title="Slide Transition"
            backgroundColor="#8E44AD"
            subtitle="Slides in from right"
          />
        </SlideTransition>
      </Sequence>

      {/* Scene 3: Wipe from Left (frames 120-179) */}
      <Sequence from={120} durationInFrames={60} name="Scene 3: Wipe">
        <WipeTransition direction="left" durationInFrames={30}>
          <Scene
            title="Wipe Transition"
            backgroundColor="#16A085"
            subtitle="Reveals with a wipe effect"
          />
        </WipeTransition>
      </Sequence>

      {/* Scene 4: Zoom In (frames 180-239) */}
      <Sequence from={180} durationInFrames={60} name="Scene 4: Zoom">
        <ZoomTransition direction="in" durationInFrames={25}>
          <Scene
            title="Zoom Transition"
            backgroundColor="#D35400"
            subtitle="Zooms in dramatically"
          />
        </ZoomTransition>
      </Sequence>

      {/* Scene 5: Circle Reveal (frames 240-299) */}
      <Sequence from={240} durationInFrames={60} name="Scene 5: Circle">
        <CircleRevealTransition durationInFrames={35}>
          <Scene
            title="Circle Reveal"
            backgroundColor="#C0392B"
            subtitle="Expands from center"
          />
        </CircleRevealTransition>
      </Sequence>

      {/* Transition Label Overlay */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 40,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "10px 20px",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 18,
            fontFamily: "system-ui",
            fontWeight: 600,
          }}
        >
          Transition Types
        </span>
      </div>
    </AbsoluteFill>
  );
};
