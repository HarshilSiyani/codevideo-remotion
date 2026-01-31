import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface TitleRevealProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  position?: "center" | "top" | "bottom";
  revealType?: "fade" | "slide" | "scale" | "split";
}

export const TitleReveal: React.FC<TitleRevealProps> = ({
  text,
  fontSize = 80,
  color = "#ffffff",
  fontFamily = "system-ui, -apple-system, sans-serif",
  position = "center",
  revealType = "fade",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealDuration = fps * 0.8; // 0.8 seconds

  const opacity = interpolate(frame, [0, revealDuration * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  let transform = "";
  let additionalStyle: React.CSSProperties = {};

  switch (revealType) {
    case "slide":
      const slideY = interpolate(frame, [0, revealDuration], [50, 0], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      transform = `translateY(${slideY}px)`;
      break;

    case "scale":
      const scale = interpolate(frame, [0, revealDuration], [0.5, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.5)),
      });
      transform = `scale(${scale})`;
      break;

    case "split":
      const letterSpacing = interpolate(frame, [0, revealDuration], [50, 0], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      additionalStyle = { letterSpacing: `${letterSpacing}px` };
      break;

    default:
      break;
  }

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    ...(position === "top" && { top: "15%" }),
    ...(position === "center" && { top: "50%", transform: `translateY(-50%) ${transform}`.trim() }),
    ...(position === "bottom" && { bottom: "15%" }),
  };

  if (position !== "center") {
    positionStyle.transform = transform;
  }

  return (
    <div style={positionStyle}>
      <h1
        style={{
          fontSize,
          fontFamily,
          fontWeight: 700,
          color,
          margin: 0,
          opacity,
          textAlign: "center",
          textShadow: `0 4px 30px ${color}40`,
          ...additionalStyle,
        }}
      >
        {text}
      </h1>
    </div>
  );
};
