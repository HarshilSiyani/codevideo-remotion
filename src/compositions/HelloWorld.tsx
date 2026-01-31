/**
 * HelloWorld Composition
 *
 * This is the simplest Remotion composition demonstrating:
 * - useCurrentFrame() - Getting the current frame number
 * - useVideoConfig() - Getting video configuration
 * - interpolate() - Animating values over time
 * - AbsoluteFill - Full-frame container
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import type { HelloWorldProps } from "../schemas";

export const HelloWorld: React.FC<HelloWorldProps> = ({
  titleText,
  titleColor,
  backgroundColor,
}) => {
  // ============================================
  // REMOTION HOOKS
  // ============================================

  /**
   * useCurrentFrame()
   * Returns the current frame number (0-indexed)
   * Frame 0 is the first frame of the video
   */
  const frame = useCurrentFrame();

  /**
   * useVideoConfig()
   * Returns video configuration object with:
   * - width: Video width in pixels
   * - height: Video height in pixels
   * - fps: Frames per second
   * - durationInFrames: Total frames in video
   * - id: Composition ID
   */
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // ============================================
  // ANIMATIONS USING INTERPOLATE
  // ============================================

  /**
   * interpolate(inputValue, inputRange, outputRange, options)
   *
   * Maps a value from one range to another
   *
   * @param inputValue - The value to interpolate (usually frame)
   * @param inputRange - Array of input breakpoints
   * @param outputRange - Array of output values (same length as inputRange)
   * @param options - Optional config (easing, extrapolation)
   */

  // Opacity: Fade in from 0 to 1 during frames 0-30
  const opacity = interpolate(
    frame,
    [0, 30], // Input: from frame 0 to 30
    [0, 1], // Output: from opacity 0 to 1
    {
      // Prevent values outside the range
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Scale: Start at 0.5, grow to 1.0 with easing
  const scale = interpolate(
    frame,
    [0, 45],
    [0.5, 1],
    {
      extrapolateRight: "clamp",
      // Easing functions make animations feel more natural
      easing: Easing.out(Easing.cubic),
    }
  );

  // Y Position: Slide up from 50px to 0px
  const translateY = interpolate(
    frame,
    [0, 40],
    [50, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.5)), // Slight overshoot
    }
  );

  // Subtitle fade in (delayed start)
  const subtitleOpacity = interpolate(
    frame,
    [40, 70], // Start later, at frame 40
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Main Title */}
      <h1
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 100,
          fontWeight: 700,
          color: titleColor,
          margin: 0,
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          textAlign: "center",
          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {titleText}
      </h1>

      {/* Subtitle with frame info */}
      <p
        style={{
          fontFamily: "monospace",
          fontSize: 24,
          color: "rgba(255,255,255,0.8)",
          marginTop: 40,
          opacity: subtitleOpacity,
        }}
      >
        Frame {frame} of {durationInFrames} | {fps} FPS | {width}x{height}
      </p>

      {/* Debug info (visible in development) */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          fontFamily: "monospace",
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          opacity: subtitleOpacity,
        }}
      >
        <p>Time: {(frame / fps).toFixed(2)}s</p>
        <p>Progress: {((frame / durationInFrames) * 100).toFixed(1)}%</p>
      </div>
    </AbsoluteFill>
  );
};
