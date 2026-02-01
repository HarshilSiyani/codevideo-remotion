import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

// Import all components
import { GradientBackground } from "../components/backgrounds/GradientBackground";
import { ParticleField } from "../components/backgrounds/ParticleField";
import { GridPattern } from "../components/backgrounds/GridPattern";
import { SolidBackground } from "../components/backgrounds/SolidBackground";

import { TitleReveal } from "../components/text/TitleReveal";
import { GlitchText } from "../components/text/GlitchText";
import { TypewriterText } from "../components/text/TypewriterText";
import { KineticText } from "../components/text/KineticText";
import { FadeText } from "../components/text/FadeText";

import { CounterAnimation } from "../components/data/CounterAnimation";
import { ProgressBar } from "../components/data/ProgressBar";

// ============================================
// SCHEMA DEFINITION
// ============================================

const backgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "particles", "grid"]),
  colors: z.array(z.string()).optional(),
  color: z.string().optional(),
  animated: z.boolean().optional(),
  density: z.enum(["low", "medium", "high"]).optional(),
  backgroundColor: z.string().optional(),
});

const textElementSchema = z.object({
  type: z.enum(["title", "glitch", "typewriter", "kinetic", "fade"]),
  text: z.string(),
  fontSize: z.number().optional().default(72),
  color: z.string().optional().default("#ffffff"),
  position: z.enum(["center", "top", "bottom"]).optional().default("center"),
  style: z.string().optional(), // For kinetic: bounce, wave, pop, slam
  delay: z.number().optional().default(0), // Delay in seconds
});

const dataElementSchema = z.object({
  type: z.enum(["counter", "progress"]),
  value: z.number(),
  label: z.string().optional(),
  color: z.string().optional(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  position: z.enum(["center", "top", "bottom"]).optional().default("center"),
});

// Simplified scene schema - scenes play sequentially
const sceneSchema = z.object({
  id: z.string(),
  duration: z.number(), // Duration in seconds
  background: backgroundSchema,
  elements: z.array(z.union([textElementSchema, dataElementSchema])),
  transition: z.enum(["fade", "slide", "wipe", "none"]).optional().default("fade"),
});

const audioSchema = z.object({
  voiceover: z.object({
    url: z.string(),
    volume: z.number().optional(),
  }).optional(),
  music: z.object({
    url: z.string(),
    volume: z.number().optional(),
  }).optional(),
});

export const videoConfigSchema = z.object({
  title: z.string(),
  duration: z.number(),
  fps: z.number().default(30),
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  scenes: z.array(sceneSchema),
  audio: audioSchema.optional(),
});

export type VideoConfig = z.infer<typeof videoConfigSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type DataElement = z.infer<typeof dataElementSchema>;

export const dynamicVideoSchema = z.object({
  config: videoConfigSchema,
});

// ============================================
// COMPONENT REGISTRY
// ============================================

const BackgroundComponents: Record<string, React.FC<any>> = {
  solid: SolidBackground,
  gradient: GradientBackground,
  particles: ParticleField,
  grid: GridPattern,
};

const TextComponents: Record<string, React.FC<any>> = {
  title: TitleReveal,
  glitch: GlitchText,
  typewriter: TypewriterText,
  kinetic: KineticText,
  fade: FadeText,
};

const DataComponents: Record<string, React.FC<any>> = {
  counter: CounterAnimation,
  progress: ProgressBar,
};

// ============================================
// TRANSITION MAPPING
// ============================================

const getTransitionPresentation = (type: string) => {
  switch (type) {
    case "slide":
      return slide({ direction: "from-right" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "fade":
    default:
      return fade();
  }
};

// ============================================
// POSITION STYLES
// ============================================

const getPositionStyles = (position: string = "center"): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0 5%",
  };

  switch (position) {
    case "top":
      return { ...base, top: "15%" };
    case "bottom":
      return { ...base, bottom: "15%" };
    case "center":
    default:
      return {
        ...base,
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
  }
};

// ============================================
// ANIMATED ELEMENT WRAPPER
// ============================================

const AnimatedElement: React.FC<{
  children: React.ReactNode;
  delay: number;
  position: string;
}> = ({ children, delay, position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = delay * fps;
  const animationFrame = Math.max(0, frame - delayFrames);

  const opacity = interpolate(animationFrame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(animationFrame, [0, 15], [30, 0], {
    extrapolateRight: "clamp",
  });

  if (frame < delayFrames) {
    return null;
  }

  return (
    <div
      style={{
        ...getPositionStyles(position),
        opacity,
        transform: `${getPositionStyles(position).transform} translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// SCENE RENDERER
// ============================================

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { fps } = useVideoConfig();

  // Render background
  const BackgroundComponent = BackgroundComponents[scene.background.type] || SolidBackground;
  const backgroundProps = scene.background;

  return (
    <AbsoluteFill>
      {/* Background */}
      <BackgroundComponent {...backgroundProps} />

      {/* Elements - staggered by delay */}
      {scene.elements.map((element, index) => {
        const delay = "delay" in element ? (element.delay || 0) : index * 0.3;
        const position = element.position || "center";

        if ("text" in element) {
          const TextComponent = TextComponents[element.type] || FadeText;

          return (
            <AnimatedElement key={index} delay={delay} position={position}>
              <TextComponent
                text={element.text}
                fontSize={element.fontSize || 72}
                color={element.color || "#ffffff"}
                style={"style" in element ? element.style : undefined}
              />
            </AnimatedElement>
          );
        }

        if ("value" in element) {
          const DataComponent = DataComponents[element.type];
          if (DataComponent) {
            return (
              <AnimatedElement key={index} delay={delay} position={position}>
                <DataComponent
                  value={element.value}
                  label={element.label}
                  color={element.color}
                  suffix={element.suffix}
                  prefix={element.prefix}
                />
              </AnimatedElement>
            );
          }
        }

        return null;
      })}
    </AbsoluteFill>
  );
};

// ============================================
// MAIN DYNAMIC VIDEO COMPONENT
// ============================================

export const DynamicVideo: React.FC<{ config: VideoConfig }> = ({ config }) => {
  const { fps } = useVideoConfig();
  const transitionDuration = 15; // 0.5 seconds at 30fps

  // Check if we should use transitions
  const hasTransitions = config.scenes.some((s) => s.transition !== "none");

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {hasTransitions ? (
        // Use TransitionSeries for smooth scene transitions
        <TransitionSeries>
          {config.scenes.map((scene, index) => {
            const durationFrames = Math.floor(scene.duration * fps);
            const isLastScene = index === config.scenes.length - 1;

            return (
              <React.Fragment key={scene.id || index}>
                <TransitionSeries.Sequence durationInFrames={durationFrames}>
                  <SceneRenderer scene={scene} />
                </TransitionSeries.Sequence>

                {/* Add transition between scenes (not after the last one) */}
                {!isLastScene && scene.transition !== "none" && (
                  <TransitionSeries.Transition
                    presentation={getTransitionPresentation(scene.transition || "fade")}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TransitionSeries>
      ) : (
        // Simple sequential scenes without transitions
        config.scenes.map((scene, index) => {
          // Calculate start frame based on previous scenes
          const startFrame = config.scenes
            .slice(0, index)
            .reduce((acc, s) => acc + Math.floor(s.duration * fps), 0);
          const durationFrames = Math.floor(scene.duration * fps);

          return (
            <Sequence
              key={scene.id || index}
              from={startFrame}
              durationInFrames={durationFrames}
              name={`Scene ${index + 1}`}
            >
              <SceneRenderer scene={scene} />
            </Sequence>
          );
        })
      )}

      {/* Audio layers */}
      {config.audio?.voiceover?.url && (
        <Audio
          src={config.audio.voiceover.url}
          volume={config.audio.voiceover.volume ?? 1}
        />
      )}

      {config.audio?.music?.url && (
        <Audio
          src={config.audio.music.url}
          volume={config.audio.music.volume ?? 0.3}
        />
      )}
    </AbsoluteFill>
  );
};
