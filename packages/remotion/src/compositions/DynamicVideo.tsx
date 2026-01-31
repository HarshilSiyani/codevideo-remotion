import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";

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

import { FadeTransition } from "../components/transitions/FadeTransition";
import { GlitchTransition } from "../components/transitions/GlitchTransition";
import { ZoomTransition } from "../components/transitions/ZoomTransition";
import { WipeTransition } from "../components/transitions/WipeTransition";

// ============================================
// SCHEMA DEFINITION
// ============================================

const backgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "particles", "grid"]),
  colors: z.array(z.string()).optional(),
  color: z.string().optional(),
  animated: z.boolean().optional(),
  density: z.enum(["low", "medium", "high"]).optional(),
});

const textElementSchema = z.object({
  type: z.enum(["title", "glitch", "typewriter", "kinetic", "fade"]),
  text: z.string(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  position: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  animation: z.object({
    delay: z.number().optional(),
    duration: z.number().optional(),
  }).optional(),
});

const dataElementSchema = z.object({
  type: z.enum(["counter", "progress"]),
  value: z.number(),
  label: z.string().optional(),
  color: z.string().optional(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
});

const sceneSchema = z.object({
  id: z.string(),
  startTime: z.number(),
  duration: z.number(),
  background: backgroundSchema.optional(),
  elements: z.array(z.union([textElementSchema, dataElementSchema])).optional(),
  transition: z.object({
    type: z.enum(["fade", "glitch", "zoom", "wipe", "none"]),
    duration: z.number().optional(),
  }).optional(),
});

const audioSchema = z.object({
  voiceover: z.object({
    url: z.string(),
    volume: z.number().optional(),
  }).optional(),
  music: z.object({
    url: z.string(),
    volume: z.number().optional(),
    fadeIn: z.number().optional(),
    fadeOut: z.number().optional(),
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

const TransitionComponents: Record<string, React.FC<any>> = {
  fade: FadeTransition,
  glitch: GlitchTransition,
  zoom: ZoomTransition,
  wipe: WipeTransition,
};

// ============================================
// SCENE RENDERER
// ============================================

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { fps } = useVideoConfig();

  // Render background
  const BackgroundComponent = scene.background
    ? BackgroundComponents[scene.background.type]
    : SolidBackground;

  const backgroundProps = scene.background || { color: "#000000" };

  return (
    <AbsoluteFill>
      {/* Background */}
      <BackgroundComponent {...backgroundProps} />

      {/* Elements */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {scene.elements?.map((element, index) => {
          if ("text" in element) {
            const TextComponent = TextComponents[element.type] || FadeText;
            const delayFrames = (element.animation?.delay || 0) * fps;

            return (
              <Sequence key={index} from={delayFrames}>
                <TextComponent
                  text={element.text}
                  fontSize={element.fontSize}
                  color={element.color}
                  position={element.position}
                />
              </Sequence>
            );
          }

          if ("value" in element) {
            const DataComponent = DataComponents[element.type];
            if (DataComponent) {
              return (
                <DataComponent
                  key={index}
                  value={element.value}
                  label={element.label}
                  color={element.color}
                  suffix={element.suffix}
                  prefix={element.prefix}
                />
              );
            }
          }

          return null;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// MAIN DYNAMIC VIDEO COMPONENT
// ============================================

export const DynamicVideo: React.FC<{ config: VideoConfig }> = ({ config }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Render each scene */}
      {config.scenes.map((scene, index) => {
        const startFrame = Math.floor(scene.startTime * fps);
        const durationFrames = Math.floor(scene.duration * fps);
        const transition = scene.transition;

        return (
          <Sequence
            key={scene.id || index}
            from={startFrame}
            durationInFrames={durationFrames}
            name={`Scene ${index + 1}`}
          >
            {/* Apply transition wrapper if specified */}
            {transition && transition.type !== "none" ? (
              (() => {
                const TransitionComponent = TransitionComponents[transition.type];
                return TransitionComponent ? (
                  <TransitionComponent duration={transition.duration}>
                    <SceneRenderer scene={scene} />
                  </TransitionComponent>
                ) : (
                  <SceneRenderer scene={scene} />
                );
              })()
            ) : (
              <SceneRenderer scene={scene} />
            )}
          </Sequence>
        );
      })}

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
