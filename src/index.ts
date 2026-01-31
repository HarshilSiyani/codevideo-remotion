/**
 * Entry Point for Remotion
 *
 * This file registers the Root component with Remotion.
 * The Root component contains all your video compositions.
 */
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

// Register the root component
// This tells Remotion where to find all your compositions
registerRoot(RemotionRoot);
