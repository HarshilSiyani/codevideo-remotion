/**
 * Zod Schemas for Composition Props
 *
 * Using Zod schemas with Remotion provides:
 * - Type-safe props with TypeScript inference
 * - Runtime validation of props
 * - Auto-generated input fields in Remotion Studio
 * - Better error messages for invalid props
 */
import { z } from "zod";

/**
 * Schema for HelloWorld composition
 */
export const helloWorldSchema = z.object({
  titleText: z.string().describe("The main title text to display"),
  titleColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Title color in hex format (e.g., #FFFFFF)"),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .describe("Background color in hex format"),
});

export type HelloWorldProps = z.infer<typeof helloWorldSchema>;

/**
 * Schema for TextAnimations composition
 */
export const textAnimationsSchema = z.object({
  text: z.string().min(1).describe("The text to animate"),
});

export type TextAnimationsProps = z.infer<typeof textAnimationsSchema>;

/**
 * Schema for CodeVideoDemo composition
 */
export const codeVideoDemoSchema = z.object({
  language: z
    .enum(["typescript", "javascript", "python", "rust", "go"])
    .describe("Programming language for syntax highlighting"),
  theme: z.enum(["dark", "light"]).describe("Color theme for the code editor"),
});

export type CodeVideoDemoProps = z.infer<typeof codeVideoDemoSchema>;
