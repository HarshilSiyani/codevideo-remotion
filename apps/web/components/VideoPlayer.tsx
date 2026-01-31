"use client";

import { Player } from "@remotion/player";
import { useMemo } from "react";

// Import the DynamicVideo component and types
import { DynamicVideo } from "@vizmo/remotion/src/compositions/DynamicVideo";
import type { VideoConfig } from "@vizmo/remotion/src/compositions/DynamicVideo";

interface VideoPlayerProps {
  config: VideoConfig;
  className?: string;
}

export function VideoPlayer({ config, className = "" }: VideoPlayerProps) {
  const fps = config.fps || 30;
  const durationInFrames = Math.ceil(config.duration * fps);
  const width = config.resolution?.width || 1920;
  const height = config.resolution?.height || 1080;

  const component = useMemo(() => DynamicVideo, []);
  const inputProps = useMemo(() => ({ config }), [config]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <Player
        component={component}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={width}
        compositionHeight={height}
        style={{
          width: "100%",
          aspectRatio: `${width} / ${height}`,
        }}
        controls
        autoPlay={false}
        loop
        clickToPlay
        showVolumeControls
        spaceKeyToPlayOrPause
      />
    </div>
  );
}
