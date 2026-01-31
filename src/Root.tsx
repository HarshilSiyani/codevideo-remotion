/**
 * Root Component - The Main Composition Registry
 *
 * This component defines all the video compositions available in your project.
 * Each <Composition> represents a separate video that can be rendered.
 *
 * COMPOSITION PROPS:
 * - id: Unique identifier for the composition (used in CLI rendering)
 * - component: The React component to render
 * - durationInFrames: Total number of frames in the video
 * - fps: Frames per second (common: 24, 30, 60)
 * - width: Video width in pixels
 * - height: Video height in pixels
 * - defaultProps: Default props passed to the component
 */
import { Composition, Folder } from "remotion";

// Import all video components
import { HelloWorld } from "./compositions/HelloWorld";
import { TextAnimations } from "./compositions/TextAnimations";
import { ShapesDemo } from "./compositions/ShapesDemo";
import { SequenceDemo } from "./compositions/SequenceDemo";
import { SpringAnimations } from "./compositions/SpringAnimations";
import { TransitionsDemo } from "./compositions/TransitionsDemo";
import { CodeVideoDemo } from "./compositions/CodeVideoDemo";

// Import schemas for type-safe props
import {
  helloWorldSchema,
  textAnimationsSchema,
  codeVideoDemoSchema,
} from "./schemas";

/**
 * Common video dimensions
 * - 1920x1080: Full HD (16:9)
 * - 1280x720: HD (16:9)
 * - 1080x1920: Portrait/Mobile (9:16)
 * - 1080x1080: Square (1:1)
 * - 3840x2160: 4K UHD (16:9)
 */
const FULL_HD = { width: 1920, height: 1080 };
const HD = { width: 1280, height: 720 };
const SQUARE = { width: 1080, height: 1080 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ============================================
          BASIC COMPOSITIONS
          ============================================ */}
      <Folder name="Basics">
        {/* Hello World - The simplest composition */}
        <Composition
          id="HelloWorld"
          component={HelloWorld}
          durationInFrames={150} // 5 seconds at 30fps
          fps={30}
          {...FULL_HD}
          schema={helloWorldSchema}
          defaultProps={{
            titleText: "Hello, Remotion!",
            titleColor: "#FFFFFF",
            backgroundColor: "#0B84F3",
          }}
        />

        {/* Text Animations - Various text animation techniques */}
        <Composition
          id="TextAnimations"
          component={TextAnimations}
          durationInFrames={300} // 10 seconds at 30fps
          fps={30}
          {...FULL_HD}
          schema={textAnimationsSchema}
          defaultProps={{
            text: "Animate Everything",
          }}
        />

        {/* Shapes Demo - Animating shapes and transforms */}
        <Composition
          id="ShapesDemo"
          component={ShapesDemo}
          durationInFrames={180}
          fps={30}
          {...FULL_HD}
        />
      </Folder>

      {/* ============================================
          TIMING & SEQUENCES
          ============================================ */}
      <Folder name="Timing">
        {/* Sequence Demo - Orchestrating multiple elements */}
        <Composition
          id="SequenceDemo"
          component={SequenceDemo}
          durationInFrames={300}
          fps={30}
          {...FULL_HD}
        />
      </Folder>

      {/* ============================================
          ADVANCED ANIMATIONS
          ============================================ */}
      <Folder name="Advanced">
        {/* Spring Animations - Physics-based motion */}
        <Composition
          id="SpringAnimations"
          component={SpringAnimations}
          durationInFrames={240}
          fps={60} // Higher fps for smoother physics
          {...FULL_HD}
        />

        {/* Transitions - Scene transitions */}
        <Composition
          id="TransitionsDemo"
          component={TransitionsDemo}
          durationInFrames={300}
          fps={30}
          {...FULL_HD}
        />
      </Folder>

      {/* ============================================
          CODE VIDEO EXAMPLE
          ============================================ */}
      <Folder name="CodeVideo">
        {/* Code Video Demo - Programming tutorial style */}
        <Composition
          id="CodeVideoDemo"
          component={CodeVideoDemo}
          durationInFrames={600} // 20 seconds
          fps={30}
          {...FULL_HD}
          schema={codeVideoDemoSchema}
          defaultProps={{
            language: "typescript",
            theme: "dark",
          }}
        />
      </Folder>

      {/* ============================================
          DIFFERENT ASPECT RATIOS
          ============================================ */}
      <Folder name="AspectRatios">
        <Composition
          id="HelloWorld-HD"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          {...HD}
          schema={helloWorldSchema}
          defaultProps={{
            titleText: "HD Version",
            titleColor: "#FFFFFF",
            backgroundColor: "#4CAF50",
          }}
        />

        <Composition
          id="HelloWorld-Square"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          {...SQUARE}
          schema={helloWorldSchema}
          defaultProps={{
            titleText: "Square Version",
            titleColor: "#FFFFFF",
            backgroundColor: "#9C27B0",
          }}
        />
      </Folder>
    </>
  );
};
