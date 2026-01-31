import React from "react";
import { Composition } from "remotion";
import { DynamicVideo, dynamicVideoSchema } from "./compositions/DynamicVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main dynamic video composition - renders any video config */}
      <Composition
        id="DynamicVideo"
        component={DynamicVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        schema={dynamicVideoSchema}
        defaultProps={{
          config: {
            title: "Untitled Video",
            duration: 60,
            fps: 30,
            resolution: { width: 1920, height: 1080 },
            scenes: [],
            audio: {},
          },
        }}
        calculateMetadata={({ props }) => {
          const { config } = props;
          const fps = config.fps || 30;
          const duration = config.duration || 60;
          return {
            durationInFrames: Math.ceil(duration * fps),
            fps,
            width: config.resolution?.width || 1920,
            height: config.resolution?.height || 1080,
          };
        }}
      />

      {/* Vertical format for TikTok/Reels */}
      <Composition
        id="DynamicVideoVertical"
        component={DynamicVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        schema={dynamicVideoSchema}
        defaultProps={{
          config: {
            title: "Untitled Video",
            duration: 60,
            fps: 30,
            resolution: { width: 1080, height: 1920 },
            scenes: [],
            audio: {},
          },
        }}
        calculateMetadata={({ props }) => {
          const { config } = props;
          const fps = config.fps || 30;
          const duration = config.duration || 60;
          return {
            durationInFrames: Math.ceil(duration * fps),
            fps,
            width: 1080,
            height: 1920,
          };
        }}
      />

      {/* Square format for Instagram */}
      <Composition
        id="DynamicVideoSquare"
        component={DynamicVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1080}
        schema={dynamicVideoSchema}
        defaultProps={{
          config: {
            title: "Untitled Video",
            duration: 60,
            fps: 30,
            resolution: { width: 1080, height: 1080 },
            scenes: [],
            audio: {},
          },
        }}
        calculateMetadata={({ props }) => {
          const { config } = props;
          const fps = config.fps || 30;
          const duration = config.duration || 60;
          return {
            durationInFrames: Math.ceil(duration * fps),
            fps,
            width: 1080,
            height: 1080,
          };
        }}
      />
    </>
  );
};
