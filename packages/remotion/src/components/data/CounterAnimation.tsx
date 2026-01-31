import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface CounterAnimationProps {
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string;
  labelColor?: string;
  duration?: number;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  fontSize = 96,
  color = "#ffffff",
  labelColor = "#888888",
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationFrames = duration * fps;

  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const currentValue = Math.floor(value * progress);

  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, fps * 0.3], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontSize,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}
        {currentValue.toLocaleString()}
        {suffix}
      </span>
      {label && (
        <span
          style={{
            fontSize: fontSize * 0.3,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
            color: labelColor,
            marginTop: fontSize * 0.1,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
