import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface GridPatternProps {
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  cellSize?: number;
  lineWidth?: number;
  perspective?: boolean;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  color = "#00ff88",
  backgroundColor = "#0a0a0a",
  animated = true,
  cellSize = 50,
  lineWidth = 1,
  perspective = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const offset = animated ? (frame * 0.5) % cellSize : 0;
  const glowIntensity = animated
    ? interpolate(Math.sin(frame / fps * 2), [-1, 1], [0.3, 0.6])
    : 0.5;

  const lines = [];

  // Vertical lines
  for (let x = -cellSize + offset; x <= width + cellSize; x += cellSize) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={perspective ? x + (x - width / 2) * 0.3 : x}
        y2={height}
        stroke={color}
        strokeWidth={lineWidth}
        opacity={glowIntensity}
      />
    );
  }

  // Horizontal lines
  for (let y = -cellSize + offset; y <= height + cellSize; y += cellSize) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={color}
        strokeWidth={lineWidth}
        opacity={glowIntensity * (perspective ? (y / height) : 1)}
      />
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          filter: `drop-shadow(0 0 ${animated ? 10 * glowIntensity : 5}px ${color})`,
        }}
      >
        {lines}
      </svg>
    </AbsoluteFill>
  );
};
