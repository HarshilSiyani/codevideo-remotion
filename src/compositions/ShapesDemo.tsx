/**
 * ShapesDemo Composition
 *
 * Demonstrates animating shapes and transforms:
 * - Rotation animations
 * - Path animations
 * - Color transitions
 * - Complex transform combinations
 * - Loop animations
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
  Easing,
} from "remotion";

// ============================================
// ANIMATED SHAPE COMPONENTS
// ============================================

/**
 * Rotating Square
 * Demonstrates continuous rotation animation
 */
const RotatingSquare: React.FC<{ size: number; color: string; speed?: number }> = ({
  size,
  color,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Full rotation every 2 seconds (adjusted by speed)
  const rotation = (frame / fps) * 180 * speed;

  // Pulsing scale effect
  const scale = interpolate(
    Math.sin(frame / 15),
    [-1, 1],
    [0.9, 1.1]
  );

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size * 0.15,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        boxShadow: `0 10px 40px ${color}80`,
      }}
    />
  );
};

/**
 * Orbiting Circle
 * Demonstrates circular motion using trigonometry
 */
const OrbitingCircle: React.FC<{
  orbitRadius: number;
  circleSize: number;
  color: string;
  speed?: number;
  startAngle?: number;
}> = ({ orbitRadius, circleSize, color, speed = 1, startAngle = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate angle (radians)
  const angle = startAngle + (frame / fps) * Math.PI * speed;

  // Calculate position on orbit
  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  // Trail effect - multiple circles with decreasing opacity
  const trailCount = 5;
  const trails = [];

  for (let i = 0; i < trailCount; i++) {
    const trailAngle = angle - (i * 0.1);
    const trailX = Math.cos(trailAngle) * orbitRadius;
    const trailY = Math.sin(trailAngle) * orbitRadius;
    const trailOpacity = 1 - (i / trailCount);
    const trailScale = 1 - (i * 0.1);

    trails.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          backgroundColor: color,
          opacity: trailOpacity * 0.5,
          transform: `translate(-50%, -50%) translate(${trailX}px, ${trailY}px) scale(${trailScale})`,
        }}
      />
    );
  }

  return (
    <>
      {trails}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          backgroundColor: color,
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          boxShadow: `0 0 20px ${color}`,
        }}
      />
    </>
  );
};

/**
 * Morphing Shape
 * Demonstrates border-radius morphing for shape transitions
 */
const MorphingShape: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();

  // Cycle through different border-radius values
  const cycle = frame % 120;

  // Morph between circle and different blob shapes
  const borderRadius = interpolate(
    cycle,
    [0, 30, 60, 90, 120],
    [50, 30, 50, 70, 50] // Percentage values
  );

  const topLeft = interpolate(cycle, [0, 60, 120], [50, 30, 50]);
  const topRight = interpolate(cycle, [0, 40, 80, 120], [50, 70, 30, 50]);
  const bottomRight = interpolate(cycle, [0, 50, 100, 120], [50, 40, 60, 50]);
  const bottomLeft = interpolate(cycle, [0, 30, 70, 120], [50, 60, 40, 50]);

  // Color animation
  const color = interpolateColors(
    frame,
    [0, 60, 120, 180],
    ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FF6B6B"]
  );

  // Rotation
  const rotation = frame * 0.5;

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: `${topLeft}% ${topRight}% ${bottomRight}% ${bottomLeft}%`,
        transform: `rotate(${rotation}deg)`,
        boxShadow: `0 20px 60px ${color}60`,
      }}
    />
  );
};

/**
 * Wave Pattern
 * Demonstrates creating animated patterns with math
 */
const WavePattern: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = [];
  const numDots = 15;

  for (let i = 0; i < numDots; i++) {
    // Sine wave offset by index creates wave effect
    const yOffset = Math.sin((frame / 10) + (i * 0.5)) * 50;
    const scale = interpolate(
      Math.sin((frame / 15) + i),
      [-1, 1],
      [0.5, 1]
    );

    const hue = (i / numDots) * 360 + frame;
    const color = `hsl(${hue}, 80%, 60%)`;

    dots.push(
      <div
        key={i}
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          backgroundColor: color,
          transform: `translateY(${yOffset}px) scale(${scale})`,
          boxShadow: `0 0 15px ${color}`,
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      {dots}
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const ShapesDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // Animated gradient background
  const gradientAngle = frame * 0.5;
  const background = `linear-gradient(${gradientAngle}deg, #1a1a2e, #16213e, #0f3460)`;

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Orbiting circles in the background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <OrbitingCircle
          orbitRadius={350}
          circleSize={40}
          color="#FF6B6B"
          speed={0.5}
          startAngle={0}
        />
        <OrbitingCircle
          orbitRadius={350}
          circleSize={30}
          color="#4ECDC4"
          speed={0.5}
          startAngle={Math.PI * 0.66}
        />
        <OrbitingCircle
          orbitRadius={350}
          circleSize={35}
          color="#FFE66D"
          speed={0.5}
          startAngle={Math.PI * 1.33}
        />
      </div>

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
        }}
      >
        {/* Top row: Rotating squares */}
        <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
          <RotatingSquare size={80} color="#FF6B6B" speed={0.5} />
          <RotatingSquare size={100} color="#4ECDC4" speed={-0.7} />
          <RotatingSquare size={80} color="#FFE66D" speed={1} />
        </div>

        {/* Center: Morphing shape */}
        <MorphingShape size={200} />

        {/* Bottom: Wave pattern */}
        <WavePattern />
      </div>

      {/* Title */}
      <h1
        style={{
          position: "absolute",
          top: 60,
          fontFamily: "system-ui, sans-serif",
          fontSize: 48,
          fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
          letterSpacing: 4,
        }}
      >
        SHAPES & TRANSFORMS
      </h1>
    </AbsoluteFill>
  );
};
