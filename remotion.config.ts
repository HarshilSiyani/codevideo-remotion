/**
 * Remotion Configuration File
 *
 * This file configures the Remotion bundler and rendering settings.
 * It's the entry point for customizing how your video is built and rendered.
 */
import { Config } from "@remotion/cli/config";

// ============================================
// BUNDLING CONFIGURATION
// ============================================

/**
 * Set the webpack override to customize bundling
 * Useful for adding loaders, plugins, or modifying webpack config
 */
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    // Add custom webpack configuration here
    // Example: Add a loader for a specific file type
    // module: {
    //   ...currentConfiguration.module,
    //   rules: [
    //     ...(currentConfiguration.module?.rules || []),
    //     { test: /\.md$/, use: 'raw-loader' }
    //   ]
    // }
  };
});

// ============================================
// VIDEO SETTINGS
// ============================================

/**
 * Set the number of retries for rendering a frame
 * Useful when rendering complex compositions that might fail
 */
Config.setDelayRenderTimeoutInMilliseconds(30000);

/**
 * Enable or disable audio
 * Set to false to speed up development if audio isn't needed
 */
// Config.setMuted(false);

/**
 * Set the codec for video rendering
 * Options: 'h264', 'h265', 'vp8', 'vp9', 'prores', 'gif'
 */
// Config.setCodec('h264');

/**
 * Set the quality of the video (0-100)
 * Higher values = better quality but larger file size
 */
// Config.setQuality(80);

/**
 * Set the number of threads to use for rendering
 * More threads = faster rendering but more CPU usage
 */
// Config.setConcurrency(4);

// ============================================
// DEVELOPMENT SETTINGS
// ============================================

/**
 * Set the port for the Remotion Studio
 */
Config.setStudioPort(3000);

/**
 * Enable keyboard shortcuts in the studio
 */
Config.setKeyboardShortcutsEnabled(true);

export {};
