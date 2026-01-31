import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface TypewriterTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  charsPerSecond?: number;
  showCursor?: boolean;
  cursorColor?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize = 48,
  color = "#ffffff",
  fontFamily = "'Fira Code', 'SF Mono', monospace",
  charsPerSecond = 20,
  showCursor = true,
  cursorColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsPerFrame = charsPerSecond / fps;
  const numCharsToShow = Math.floor(frame * charsPerFrame);
  const displayedText = text.slice(0, numCharsToShow);
  const isTypingComplete = numCharsToShow >= text.length;

  // Blinking cursor
  const cursorOpacity = showCursor
    ? isTypingComplete
      ? interpolate(Math.sin(frame / fps * Math.PI * 4), [-1, 1], [0, 1])
      : 1
    : 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px 40px",
      }}
    >
      <p
        style={{
          fontSize,
          fontFamily,
          color,
          margin: 0,
          whiteSpace: "pre-wrap",
          textAlign: "center",
        }}
      >
        {displayedText}
        <span
          style={{
            opacity: cursorOpacity,
            color: cursorColor || color,
            marginLeft: 2,
          }}
        >
          |
        </span>
      </p>
    </div>
  );
};
