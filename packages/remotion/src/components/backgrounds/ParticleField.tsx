import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface ParticleFieldProps {
  color?: string;
  colors?: string[];
  density?: "low" | "medium" | "high";
  speed?: number;
  backgroundColor?: string;
}

const DENSITY_MAP = {
  low: 30,
  medium: 60,
  high: 100,
};

export const ParticleField: React.FC<ParticleFieldProps> = ({
  color = "#ffffff",
  colors,
  density = "medium",
  speed = 1,
  backgroundColor = "#0a0a0a",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    const count = DENSITY_MAP[density];
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      speed: (Math.random() * 0.5 + 0.5) * speed,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [density, width, height, speed]);

  const getColor = (index: number) => {
    if (colors && colors.length > 0) {
      return colors[index % colors.length];
    }
    return color;
  };

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {particles.map((particle, i) => {
          const yOffset = (frame * particle.speed) % height;
          const y = (particle.y + yOffset) % height;

          const pulse = interpolate(
            Math.sin((frame / fps) * 2 + i),
            [-1, 1],
            [0.5, 1]
          );

          return (
            <circle
              key={i}
              cx={particle.x}
              cy={y}
              r={particle.size * pulse}
              fill={getColor(i)}
              opacity={particle.opacity * pulse}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
