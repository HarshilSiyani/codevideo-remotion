import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: string;
  backgroundColor?: string;
  height?: number;
  width?: number;
  showPercentage?: boolean;
  duration?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = "#00ff88",
  backgroundColor = "#333333",
  height = 20,
  width = 400,
  showPercentage = true,
  duration = 1.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationFrames = duration * fps;

  const progress = interpolate(frame, [0, durationFrames], [0, value], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity,
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 18,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            color: "#ffffff",
          }}
        >
          {label}
        </span>
      )}

      <div
        style={{
          width,
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: height / 2,
            boxShadow: `0 0 20px ${color}80`,
            transition: "none",
          }}
        />
      </div>

      {showPercentage && (
        <span
          style={{
            fontSize: 24,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};
