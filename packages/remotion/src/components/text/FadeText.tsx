import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface FadeTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  position?: "center" | "top" | "bottom";
  fadeInDuration?: number;
}

export const FadeText: React.FC<FadeTextProps> = ({
  text,
  fontSize = 48,
  color = "#ffffff",
  fontFamily = "system-ui, -apple-system, sans-serif",
  position = "center",
  fadeInDuration = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeFrames = fadeInDuration * fps;

  const opacity = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const translateY = interpolate(frame, [0, fadeFrames], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    padding: "0 40px",
    ...(position === "top" && { top: "20%" }),
    ...(position === "center" && { top: "50%", transform: `translateY(calc(-50% + ${translateY}px))` }),
    ...(position === "bottom" && { bottom: "20%" }),
  };

  if (position !== "center") {
    positionStyle.transform = `translateY(${translateY}px)`;
  }

  return (
    <div style={positionStyle}>
      <p
        style={{
          fontSize,
          fontFamily,
          fontWeight: 500,
          color,
          margin: 0,
          opacity,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {text}
      </p>
    </div>
  );
};
