/**
 * TextAnimations Composition
 *
 * Demonstrates various text animation techniques:
 * - Character-by-character animation
 * - Word-by-word animation
 * - Typewriter effect
 * - Fade and slide animations
 * - Using Sequence for timing
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  Easing,
} from "remotion";
import type { TextAnimationsProps } from "../schemas";

// ============================================
// ANIMATED TEXT COMPONENTS
// ============================================

/**
 * Character-by-character fade in animation
 * Each character fades in with a delay based on its index
 */
const CharacterFadeIn: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const characters = text.split("");

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {characters.map((char, index) => {
        // Each character starts animating 3 frames after the previous
        const delay = index * 3;

        const opacity = interpolate(
          frame,
          [delay, delay + 15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const translateY = interpolate(
          frame,
          [delay, delay + 15],
          [20, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }
        );

        return (
          <span
            key={index}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: "inline-block",
              // Preserve spaces
              whiteSpace: "pre",
              fontSize: 80,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              color: "#FFFFFF",
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Word-by-word slide animation
 * Each word slides in from below with a staggered delay
 */
const WordSlideIn: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
      {words.map((word, index) => {
        const delay = index * 10;

        const opacity = interpolate(
          frame,
          [delay, delay + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const translateY = interpolate(
          frame,
          [delay, delay + 20],
          [60, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.7)),
          }
        );

        return (
          <span
            key={index}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: "inline-block",
              fontSize: 60,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              color: "#FFD93D",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Typewriter effect
 * Text appears one character at a time with a blinking cursor
 */
const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Characters per second typing speed
  const charsPerSecond = 15;
  const charsPerFrame = charsPerSecond / fps;

  // Calculate how many characters to show
  const numCharsToShow = Math.floor(frame * charsPerFrame);
  const displayedText = text.slice(0, numCharsToShow);

  // Blinking cursor (blinks every 0.5 seconds)
  const cursorOpacity = Math.sin(frame / fps * Math.PI * 4) > 0 ? 1 : 0;

  // Show cursor while typing, then blink when done
  const isTypingComplete = numCharsToShow >= text.length;
  const showCursor = !isTypingComplete || cursorOpacity;

  return (
    <div
      style={{
        fontFamily: "'Fira Code', 'SF Mono', monospace",
        fontSize: 48,
        color: "#00FF88",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: "20px 40px",
        borderRadius: 10,
      }}
    >
      {displayedText}
      <span
        style={{
          opacity: showCursor ? 1 : 0,
          marginLeft: 2,
        }}
      >
        |
      </span>
    </div>
  );
};

/**
 * Scale pop animation
 * Text pops in with a scale animation
 */
const PopText: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [0, 15, 20],
    [0, 1.2, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const opacity = interpolate(
    frame,
    [0, 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <h2
      style={{
        fontSize: 72,
        fontWeight: 800,
        fontFamily: "system-ui, sans-serif",
        color,
        margin: 0,
        transform: `scale(${scale})`,
        opacity,
        textShadow: "0 4px 15px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </h2>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const TextAnimations: React.FC<TextAnimationsProps> = ({ text }) => {
  const frame = useCurrentFrame();

  // Background color that shifts over time
  const hue = interpolate(frame, [0, 300], [220, 280]);
  const backgroundColor = `hsl(${hue}, 70%, 15%)`;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/**
       * Sequence Component
       *
       * <Sequence> offsets its children in time
       * - from: Frame number when the sequence starts
       * - durationInFrames: How long the sequence lasts (optional)
       * - name: Label shown in Remotion Studio timeline
       *
       * Inside a Sequence, useCurrentFrame() returns 0 at the start
       * of that sequence, not the global frame number.
       */}

      {/* Scene 1: Character animation (frames 0-89) */}
      <Sequence from={0} durationInFrames={90} name="Character Fade">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CharacterFadeIn text={text} />
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              marginTop: 40,
            }}
          >
            Character-by-character animation
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Word animation (frames 60-149) */}
      <Sequence from={60} durationInFrames={90} name="Word Slide">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <WordSlideIn text="Build Videos With Code" />
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              marginTop: 40,
            }}
          >
            Word-by-word slide animation
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Typewriter (frames 120-219) */}
      <Sequence from={120} durationInFrames={100} name="Typewriter">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TypewriterText text="const video = await remotion.render();" />
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              marginTop: 40,
            }}
          >
            Typewriter effect
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Pop animation (frames 200-300) */}
      <Sequence from={200} name="Pop Animation">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 30,
            flexDirection: "column",
          }}
        >
          <Sequence from={0}>
            <PopText text="Create" color="#FF6B6B" />
          </Sequence>
          <Sequence from={15}>
            <PopText text="Amazing" color="#4ECDC4" />
          </Sequence>
          <Sequence from={30}>
            <PopText text="Videos!" color="#FFE66D" />
          </Sequence>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
