# Learning Remotion Video Programming

A comprehensive guide to creating videos programmatically with React and Remotion.

## Table of Contents

1. [What is Remotion?](#what-is-remotion)
2. [Core Concepts](#core-concepts)
3. [Project Structure](#project-structure)
4. [Essential Hooks](#essential-hooks)
5. [Animation Techniques](#animation-techniques)
6. [Timing & Sequences](#timing--sequences)
7. [Spring Physics](#spring-physics)
8. [Rendering Videos](#rendering-videos)
9. [Best Practices](#best-practices)
10. [Advanced Topics](#advanced-topics)

---

## What is Remotion?

**Remotion** is a framework for creating videos using React. Instead of using traditional video editing software, you write React components that render each frame of your video.

### Key Benefits

| Feature | Description |
|---------|-------------|
| **Declarative** | Write videos as React components |
| **Programmatic** | Generate dynamic content with code |
| **Type-safe** | Full TypeScript support |
| **Reusable** | Create component libraries for videos |
| **Scalable** | Render videos in parallel on servers |

### How It Works

1. You write React components that render a single frame
2. Remotion calls your component once per frame (e.g., 30 times per second)
3. The `useCurrentFrame()` hook tells you which frame you're on
4. You calculate animations based on the frame number
5. Remotion combines all frames into a video file

---

## Core Concepts

### Composition

A **Composition** defines a video with specific properties:

```tsx
<Composition
  id="MyVideo"                    // Unique identifier
  component={MyVideoComponent}    // React component to render
  durationInFrames={150}          // Total frames (5 seconds at 30fps)
  fps={30}                        // Frames per second
  width={1920}                    // Video width in pixels
  height={1080}                   // Video height in pixels
  defaultProps={{                 // Default props for the component
    title: "Hello World"
  }}
/>
```

### Frame

A **frame** is a single image in the video. At 30fps, frame 0 is 0 seconds, frame 30 is 1 second, frame 60 is 2 seconds, etc.

```tsx
const frame = useCurrentFrame();
// frame 0 = 0.00s
// frame 15 = 0.50s
// frame 30 = 1.00s
```

### AbsoluteFill

A container that fills the entire video frame:

```tsx
<AbsoluteFill style={{ backgroundColor: 'blue' }}>
  <h1>Centered Content</h1>
</AbsoluteFill>
```

---

## Project Structure

```
my-remotion-project/
├── src/
│   ├── index.ts              # Entry point (registerRoot)
│   ├── Root.tsx              # All compositions defined here
│   ├── schemas.ts            # Zod schemas for props validation
│   ├── compositions/         # Video components
│   │   ├── HelloWorld.tsx
│   │   └── MyVideo.tsx
│   └── hooks/                # Custom hooks
│       └── useAnimation.ts
├── remotion.config.ts        # Remotion configuration
├── package.json
└── tsconfig.json
```

---

## Essential Hooks

### useCurrentFrame()

Returns the current frame number (0-indexed):

```tsx
const frame = useCurrentFrame();
// Frame 0 is the first frame
// Frame 29 is the last frame of the first second (at 30fps)
```

### useVideoConfig()

Returns video configuration:

```tsx
const { width, height, fps, durationInFrames, id } = useVideoConfig();

// width: Video width in pixels (e.g., 1920)
// height: Video height in pixels (e.g., 1080)
// fps: Frames per second (e.g., 30)
// durationInFrames: Total frames in video
// id: Composition ID
```

---

## Animation Techniques

### interpolate()

Maps a value from one range to another:

```tsx
import { interpolate } from 'remotion';

// Fade in from 0 to 1 during frames 0-30
const opacity = interpolate(
  frame,           // Input value
  [0, 30],         // Input range
  [0, 1],          // Output range
  {
    extrapolateLeft: 'clamp',   // Don't go below 0
    extrapolateRight: 'clamp',  // Don't go above 1
  }
);
```

### Easing Functions

Make animations feel more natural:

```tsx
import { Easing } from 'remotion';

const value = interpolate(frame, [0, 30], [0, 100], {
  easing: Easing.out(Easing.cubic),  // Smooth deceleration
});

// Common easing options:
// Easing.linear        - Constant speed
// Easing.ease          - Default ease
// Easing.in(fn)        - Accelerate
// Easing.out(fn)       - Decelerate
// Easing.inOut(fn)     - Accelerate then decelerate
// Easing.bezier(...)   - Custom bezier curve
// Easing.back(s)       - Overshoot effect
// Easing.bounce        - Bounce effect
// Easing.elastic(b)    - Elastic effect
```

### interpolateColors()

Animate between colors:

```tsx
import { interpolateColors } from 'remotion';

const color = interpolateColors(
  frame,
  [0, 30, 60],                              // Keyframes
  ['#FF0000', '#00FF00', '#0000FF']         // Colors
);
```

---

## Timing & Sequences

### Sequence

Offsets children in time:

```tsx
import { Sequence } from 'remotion';

// This content appears at frame 30 (1 second at 30fps)
<Sequence from={30}>
  <MyComponent />
</Sequence>

// With duration limit
<Sequence from={30} durationInFrames={60}>
  <MyComponent />  {/* Visible from frame 30-89 */}
</Sequence>
```

**Important**: Inside a `<Sequence>`, `useCurrentFrame()` returns the frame relative to the sequence start, not the global frame.

### Series

Automatically sequences children one after another:

```tsx
import { Series } from 'remotion';

<Series>
  <Series.Sequence durationInFrames={30}>
    <Scene1 />   {/* Frames 0-29 */}
  </Series.Sequence>

  <Series.Sequence durationInFrames={60}>
    <Scene2 />   {/* Frames 30-89 */}
  </Series.Sequence>

  <Series.Sequence durationInFrames={30}>
    <Scene3 />   {/* Frames 90-119 */}
  </Series.Sequence>
</Series>
```

---

## Spring Physics

### spring()

Creates physics-based animations:

```tsx
import { spring } from 'remotion';

const value = spring({
  frame,
  fps,
  config: {
    damping: 10,      // Controls bounce (lower = more bounce)
    mass: 1,          // Weight (higher = slower)
    stiffness: 100,   // Spring tightness (higher = faster)
  },
});
```

### Spring Presets

```tsx
// Bouncy animation
{ damping: 5, mass: 1, stiffness: 100 }

// Smooth animation
{ damping: 20, mass: 1, stiffness: 100 }

// Quick snap
{ damping: 15, mass: 0.5, stiffness: 200 }

// Heavy/slow
{ damping: 15, mass: 2, stiffness: 80 }
```

---

## Rendering Videos

### Development Preview

```bash
# Start the Remotion Studio
npm run start
# or
npx remotion studio
```

### Render to File

```bash
# Render specific composition
npx remotion render MyVideo out/my-video.mp4

# Render with custom settings
npx remotion render MyVideo out/my-video.mp4 \
  --codec h264 \
  --quality 80 \
  --fps 60
```

### Render Options

| Option | Description |
|--------|-------------|
| `--codec` | Video codec (h264, h265, vp8, vp9, prores, gif) |
| `--quality` | Quality 0-100 (higher = better, larger file) |
| `--fps` | Override frames per second |
| `--scale` | Scale factor (0.5 = half resolution) |
| `--concurrency` | Number of parallel render threads |
| `--props` | JSON string of props to pass |

### Programmatic Rendering

```tsx
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const bundled = await bundle('./src/index.ts');
const composition = await selectComposition({
  serveUrl: bundled,
  id: 'MyVideo',
});

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: 'out/video.mp4',
});
```

---

## Best Practices

### 1. Keep Components Pure

```tsx
// GOOD: Deterministic based on frame
const opacity = interpolate(frame, [0, 30], [0, 1]);

// BAD: Random values will differ each render
const opacity = Math.random();
```

### 2. Use Sequences for Organization

```tsx
// GOOD: Clear timing organization
<>
  <Sequence from={0} name="Intro">
    <Intro />
  </Sequence>
  <Sequence from={90} name="Main Content">
    <MainContent />
  </Sequence>
  <Sequence from={180} name="Outro">
    <Outro />
  </Sequence>
</>
```

### 3. Clamp Extrapolation

```tsx
// GOOD: Values stay in expected range
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// RISKY: Values can go below 0 or above 1
const opacity = interpolate(frame, [0, 30], [0, 1]);
```

### 4. Use Schema Validation

```tsx
import { z } from 'zod';

const mySchema = z.object({
  title: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

<Composition
  id="MyVideo"
  schema={mySchema}
  defaultProps={{ title: 'Hello', color: '#FF0000' }}
  // ...
/>
```

### 5. Optimize Performance

```tsx
// Avoid heavy calculations every frame
// BAD:
const heavyValue = expensiveCalculation(frame);

// GOOD: Memoize when possible
const heavyValue = useMemo(() => {
  return expensiveCalculation(someStaticValue);
}, [someStaticValue]);
```

---

## Advanced Topics

### Audio

```tsx
import { Audio, staticFile } from 'remotion';

<Audio src={staticFile('music.mp3')} />

// With volume control
<Audio
  src={staticFile('music.mp3')}
  volume={(f) => interpolate(f, [0, 30], [0, 1])}
/>
```

### Images & Static Files

```tsx
import { Img, staticFile } from 'remotion';

<Img src={staticFile('logo.png')} />
```

### Video-in-Video

```tsx
import { Video, staticFile } from 'remotion';

<Video src={staticFile('background.mp4')} />
```

### Offthread Video (Better Performance)

```tsx
import { OffthreadVideo } from 'remotion';

<OffthreadVideo src={staticFile('background.mp4')} />
```

### delayRender / continueRender

For async operations (loading fonts, fetching data):

```tsx
import { delayRender, continueRender } from 'remotion';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        continueRender(handle);
      });
  }, [handle]);

  if (!data) return null;
  return <div>{data.message}</div>;
};
```

### Custom Fonts

```tsx
import { staticFile } from 'remotion';

// In a useEffect or component
const fontFamily = 'MyCustomFont';
const font = new FontFace(fontFamily, `url(${staticFile('font.woff2')})`);
await font.load();
document.fonts.add(font);
```

---

## Quick Reference

### Common Frame Calculations

```tsx
// Time in seconds
const timeInSeconds = frame / fps;

// Progress through video (0-1)
const progress = frame / durationInFrames;

// Looping value
const loopFrame = frame % 60;  // Loops every 60 frames

// Delayed start
const delayedFrame = Math.max(0, frame - 30);  // Starts at frame 30
```

### Common Interpolations

```tsx
// Fade in
interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })

// Fade out
interpolate(frame, [0, 30], [1, 0], { extrapolateRight: 'clamp' })

// Slide in from left
interpolate(frame, [0, 30], [-100, 0], { easing: Easing.out(Easing.cubic) })

// Scale up
interpolate(frame, [0, 30], [0, 1], { easing: Easing.out(Easing.back(1.5)) })

// Rotate
interpolate(frame, [0, 60], [0, 360])  // Full rotation in 60 frames
```

---

## Running This Project

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Render a video
npm run render

# Render as GIF
npm run render:gif
```

---

## Resources

- [Remotion Documentation](https://www.remotion.dev/docs)
- [Remotion GitHub](https://github.com/remotion-dev/remotion)
- [Remotion Discord](https://discord.gg/remotion)
- [Example Videos](https://www.remotion.dev/showcase)

Happy video programming! 🎬
