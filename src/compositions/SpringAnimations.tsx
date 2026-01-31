/**
 * SpringAnimations Composition
 *
 * Demonstrates physics-based animations using spring():
 * - Basic spring animation
 * - Spring configuration options
 * - Comparing different spring settings
 * - Chained spring animations
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import React from "react";

// ============================================
// SPRING CONFIGURATION TYPES
// ============================================

/**
 * Spring Configuration
 *
 * spring() parameters:
 * - frame: Current frame number
 * - fps: Frames per second (from useVideoConfig)
 * - config: Spring physics configuration
 *   - damping: Controls bounce (lower = more bounce, default: 10)
 *   - mass: Weight of the object (higher = slower, default: 1)
 *   - stiffness: Spring tightness (higher = faster, default: 100)
 *   - overshootClamping: Prevent overshoot (default: false)
 * - from: Starting value (default: 0)
 * - to: Ending value (default: 1)
 * - durationInFrames: Optional duration constraint
 * - durationRestThreshold: When to consider animation complete
 */

// ============================================
// ANIMATED COMPONENTS
// ============================================

/**
 * Bouncing Ball
 * Demonstrates a bouncy spring animation
 */
const BouncingBall: React.FC<{
  color: string;
  damping: number;
  label: string;
  delay?: number;
}> = ({ color, damping, label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation with custom damping
  const springValue = spring({
    frame: frame - delay,
    fps,
    config: {
      damping,
      mass: 1,
      stiffness: 100,
    },
  });

  // Map spring value to position (0 = top, 1 = bottom)
  const translateY = interpolate(springValue, [0, 1], [-200, 0]);

  const scale = interpolate(springValue, [0, 0.5, 1], [0.8, 1.1, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: color,
          transform: `translateY(${translateY}px) scale(${scale})`,
          boxShadow: `0 20px 40px ${color}60`,
        }}
      />
      <div
        style={{
          color: "white",
          fontSize: 14,
          fontFamily: "monospace",
          textAlign: "center",
        }}
      >
        <div>{label}</div>
        <div style={{ opacity: 0.6 }}>damping: {damping}</div>
      </div>
    </div>
  );
};

/**
 * Spring Comparison Panel
 * Shows springs with different stiffness values
 */
const StiffnessComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stiffnessValues = [50, 100, 200, 400];
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFE66D"];

  return (
    <div
      style={{
        display: "flex",
        gap: 60,
        alignItems: "flex-end",
      }}
    >
      {stiffnessValues.map((stiffness, index) => {
        const springValue = spring({
          frame,
          fps,
          config: {
            damping: 15,
            mass: 1,
            stiffness,
          },
        });

        const width = interpolate(springValue, [0, 1], [0, 200]);

        return (
          <div
            key={stiffness}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 60,
                height: width,
                backgroundColor: colors[index],
                borderRadius: 10,
                boxShadow: `0 10px 30px ${colors[index]}50`,
              }}
            />
            <div
              style={{
                color: "white",
                fontSize: 12,
                fontFamily: "monospace",
                opacity: 0.8,
              }}
            >
              stiffness: {stiffness}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Mass Comparison
 * Shows how mass affects spring animation
 */
const MassComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const massValues = [0.5, 1, 2, 4];
  const colors = ["#E74C3C", "#9B59B6", "#3498DB", "#2ECC71"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {massValues.map((mass, index) => {
        const springValue = spring({
          frame,
          fps,
          config: {
            damping: 15,
            mass,
            stiffness: 100,
          },
        });

        const translateX = interpolate(springValue, [0, 1], [-400, 0]);

        return (
          <div
            key={mass}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: 12,
                fontFamily: "monospace",
                width: 80,
                opacity: 0.8,
              }}
            >
              mass: {mass}
            </div>
            <div
              style={{
                width: 60 + mass * 20,
                height: 40,
                backgroundColor: colors[index],
                borderRadius: 10,
                transform: `translateX(${translateX}px)`,
                boxShadow: `0 5px 20px ${colors[index]}50`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Chained Spring Animation
 * One animation triggers another
 */
const ChainedSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // First spring
  const spring1 = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Second spring starts when first is ~80% complete
  const spring2Start = 15; // frames
  const spring2 = spring({
    frame: frame - spring2Start,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Third spring
  const spring3Start = 30;
  const spring3 = spring({
    frame: frame - spring3Start,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const elements = [
    { spring: spring1, color: "#FF6B6B", label: "1" },
    { spring: spring2, color: "#4ECDC4", label: "2" },
    { spring: spring3, color: "#FFE66D", label: "3" },
  ];

  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      {elements.map((el, index) => {
        const scale = interpolate(el.spring, [0, 1], [0, 1]);
        const rotation = interpolate(el.spring, [0, 1], [180, 0]);

        return (
          <div
            key={index}
            style={{
              width: 100,
              height: 100,
              backgroundColor: el.color,
              borderRadius: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              boxShadow: `0 15px 40px ${el.color}50`,
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: 36,
                fontWeight: 700,
                fontFamily: "system-ui",
              }}
            >
              {el.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const SpringAnimations: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0D1B2A",
      }}
    >
      {/* Title */}
      <h1
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          color: "white",
          fontSize: 36,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Spring Physics
      </h1>

      {/* Section 1: Damping comparison (frames 0-79) */}
      <Sequence from={0} durationInFrames={80} name="Damping Comparison">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 24,
                fontFamily: "system-ui",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              Damping Controls Bounce
            </h2>
            <div style={{ display: "flex", gap: 80 }}>
              <BouncingBall color="#FF6B6B" damping={5} label="Very Bouncy" />
              <BouncingBall color="#4ECDC4" damping={10} label="Bouncy" delay={5} />
              <BouncingBall color="#FFE66D" damping={15} label="Smooth" delay={10} />
              <BouncingBall color="#9B59B6" damping={25} label="No Bounce" delay={15} />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Section 2: Stiffness comparison (frames 80-159) */}
      <Sequence from={80} durationInFrames={80} name="Stiffness Comparison">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 24,
                fontFamily: "system-ui",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              Stiffness Controls Speed
            </h2>
            <StiffnessComparison />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Section 3: Mass comparison (frames 160-199) */}
      <Sequence from={160} durationInFrames={40} name="Mass Comparison">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 24,
                fontFamily: "system-ui",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              Mass Controls Weight
            </h2>
            <MassComparison />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Section 4: Chained springs (frames 200-239) */}
      <Sequence from={200} durationInFrames={40} name="Chained Springs">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 24,
                fontFamily: "system-ui",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              Chained Spring Animations
            </h2>
            <ChainedSpring />
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
