/**
 * Custom Animation Hooks
 *
 * Reusable hooks for common animation patterns in Remotion.
 * These hooks simplify creating consistent animations across compositions.
 */
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ============================================
// TYPES
// ============================================

export interface FadeOptions {
  startFrame?: number;
  durationInFrames?: number;
  direction?: "in" | "out" | "inOut";
}

export interface SlideOptions {
  startFrame?: number;
  durationInFrames?: number;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
}

export interface SpringOptions {
  startFrame?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
}

export interface ScaleOptions {
  startFrame?: number;
  durationInFrames?: number;
  from?: number;
  to?: number;
}

// ============================================
// HOOKS
// ============================================

/**
 * useFade - Fade in/out animation
 *
 * @example
 * const opacity = useFade({ direction: 'in', durationInFrames: 30 });
 * return <div style={{ opacity }}>Fading content</div>;
 */
export const useFade = (options: FadeOptions = {}): number => {
  const frame = useCurrentFrame();
  const { durationInFrames: totalDuration } = useVideoConfig();

  const {
    startFrame = 0,
    durationInFrames = 30,
    direction = "in",
  } = options;

  const localFrame = frame - startFrame;

  if (direction === "in") {
    return interpolate(localFrame, [0, durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  if (direction === "out") {
    return interpolate(localFrame, [0, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // inOut - fade in at start, fade out at end
  const fadeInEnd = durationInFrames;
  const fadeOutStart = totalDuration - durationInFrames;

  if (frame < fadeInEnd) {
    return interpolate(frame, [0, fadeInEnd], [0, 1], {
      extrapolateRight: "clamp",
    });
  }

  if (frame > fadeOutStart) {
    return interpolate(frame, [fadeOutStart, totalDuration], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  return 1;
};

/**
 * useSlide - Slide animation in any direction
 *
 * @example
 * const translateX = useSlide({ direction: 'right', distance: 100 });
 * return <div style={{ transform: `translateX(${translateX}px)` }}>Sliding</div>;
 */
export const useSlide = (options: SlideOptions = {}): number => {
  const frame = useCurrentFrame();

  const {
    startFrame = 0,
    durationInFrames = 30,
    direction = "left",
    distance = 100,
  } = options;

  const localFrame = frame - startFrame;

  const startValue =
    direction === "left" || direction === "up" ? -distance : distance;

  return interpolate(localFrame, [0, durationInFrames], [startValue, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * useSpringAnimation - Physics-based spring animation
 *
 * @example
 * const scale = useSpringAnimation({ damping: 10 });
 * return <div style={{ transform: `scale(${scale})` }}>Bouncy!</div>;
 */
export const useSpringAnimation = (options: SpringOptions = {}): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    startFrame = 0,
    damping = 10,
    mass = 1,
    stiffness = 100,
  } = options;

  return spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping,
      mass,
      stiffness,
    },
  });
};

/**
 * useScale - Scale animation
 *
 * @example
 * const scale = useScale({ from: 0, to: 1 });
 * return <div style={{ transform: `scale(${scale})` }}>Growing</div>;
 */
export const useScale = (options: ScaleOptions = {}): number => {
  const frame = useCurrentFrame();

  const {
    startFrame = 0,
    durationInFrames = 30,
    from = 0,
    to = 1,
  } = options;

  const localFrame = frame - startFrame;

  return interpolate(localFrame, [0, durationInFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
};

/**
 * useProgress - Get normalized progress through the video (0-1)
 *
 * @example
 * const progress = useProgress();
 * // progress is 0 at start, 0.5 at middle, 1 at end
 */
export const useProgress = (): number => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return frame / durationInFrames;
};

/**
 * useTime - Get current time in seconds
 *
 * @example
 * const time = useTime();
 * // time is the current playback time in seconds
 */
export const useTime = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return frame / fps;
};

/**
 * useLoop - Create a looping value
 *
 * @param durationInFrames - Length of one loop cycle
 * @returns Value from 0-1 that loops
 *
 * @example
 * const loopValue = useLoop(60); // loops every 2 seconds at 30fps
 * const rotation = loopValue * 360; // continuous rotation
 */
export const useLoop = (durationInFrames: number): number => {
  const frame = useCurrentFrame();

  return (frame % durationInFrames) / durationInFrames;
};

/**
 * usePulse - Create a pulsing value using sine wave
 *
 * @param frequency - How fast to pulse (higher = faster)
 * @returns Value from 0-1 that pulses smoothly
 *
 * @example
 * const pulse = usePulse(0.1);
 * const scale = 1 + pulse * 0.1; // pulses between 1 and 1.1
 */
export const usePulse = (frequency: number = 0.1): number => {
  const frame = useCurrentFrame();

  // Convert sine wave from [-1, 1] to [0, 1]
  return (Math.sin(frame * frequency) + 1) / 2;
};

/**
 * useDelayedAnimation - Run animation after a delay
 *
 * @param delayFrames - Number of frames to wait before starting
 * @param durationInFrames - Duration of the animation
 * @returns Value from 0-1 (0 before delay, animates to 1 after)
 *
 * @example
 * const value = useDelayedAnimation(30, 60); // waits 1s, animates over 2s
 */
export const useDelayedAnimation = (
  delayFrames: number,
  durationInFrames: number
): number => {
  const frame = useCurrentFrame();

  return interpolate(
    frame,
    [delayFrames, delayFrames + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
};
