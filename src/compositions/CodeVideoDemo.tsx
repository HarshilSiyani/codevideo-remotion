/**
 * CodeVideoDemo Composition
 *
 * Demonstrates creating programming tutorial videos:
 * - Code editor simulation
 * - Syntax highlighting (simulated)
 * - Typing animation
 * - Line highlighting
 * - Code explanations
 */
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  Easing,
} from "remotion";
import React from "react";
import type { CodeVideoDemoProps } from "../schemas";

// ============================================
// SYNTAX HIGHLIGHTING (SIMPLIFIED)
// ============================================

type TokenType = "keyword" | "string" | "number" | "comment" | "function" | "type" | "operator" | "plain";

interface Token {
  text: string;
  type: TokenType;
}

const tokenColors: Record<TokenType, string> = {
  keyword: "#C678DD",
  string: "#98C379",
  number: "#D19A66",
  comment: "#5C6370",
  function: "#61AFEF",
  type: "#E5C07B",
  operator: "#56B6C2",
  plain: "#ABB2BF",
};

/**
 * Simple tokenizer for TypeScript-like syntax
 */
const tokenize = (code: string): Token[] => {
  const keywords = ["const", "let", "function", "return", "async", "await", "import", "from", "export", "interface", "type", "if", "else", "for", "while"];
  const types = ["string", "number", "boolean", "void", "Promise", "Record"];

  const tokens: Token[] = [];
  const words = code.split(/(\s+|[{}()[\];:,.<>=+\-*/]|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*$)/gm);

  for (const word of words) {
    if (!word) continue;

    if (keywords.includes(word)) {
      tokens.push({ text: word, type: "keyword" });
    } else if (types.includes(word)) {
      tokens.push({ text: word, type: "type" });
    } else if (word.startsWith("//")) {
      tokens.push({ text: word, type: "comment" });
    } else if (/^["'`]/.test(word)) {
      tokens.push({ text: word, type: "string" });
    } else if (/^\d+$/.test(word)) {
      tokens.push({ text: word, type: "number" });
    } else if (/^[{}()[\];:,.<>=+\-*/]$/.test(word)) {
      tokens.push({ text: word, type: "operator" });
    } else if (/^[a-zA-Z_]\w*$/.test(word) && tokens.length > 0) {
      // Check if followed by ( for function detection
      tokens.push({ text: word, type: "plain" });
    } else {
      tokens.push({ text: word, type: "plain" });
    }
  }

  return tokens;
};

// ============================================
// CODE EDITOR COMPONENTS
// ============================================

/**
 * Code Line Component
 */
const CodeLine: React.FC<{
  lineNumber: number;
  code: string;
  isHighlighted?: boolean;
  isVisible?: boolean;
}> = ({ lineNumber, code, isHighlighted = false, isVisible = true }) => {
  const tokens = tokenize(code);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "2px 0",
        backgroundColor: isHighlighted ? "rgba(97, 175, 239, 0.1)" : "transparent",
        borderLeft: isHighlighted ? "3px solid #61AFEF" : "3px solid transparent",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s",
      }}
    >
      {/* Line number */}
      <span
        style={{
          width: 50,
          textAlign: "right",
          paddingRight: 20,
          color: "#5C6370",
          fontSize: 16,
          fontFamily: "'Fira Code', 'SF Mono', monospace",
          userSelect: "none",
        }}
      >
        {lineNumber}
      </span>

      {/* Code content */}
      <span style={{ flex: 1 }}>
        {tokens.map((token, index) => (
          <span
            key={index}
            style={{
              color: tokenColors[token.type],
              fontSize: 18,
              fontFamily: "'Fira Code', 'SF Mono', monospace",
              whiteSpace: "pre",
            }}
          >
            {token.text}
          </span>
        ))}
      </span>
    </div>
  );
};

/**
 * Code Editor Component
 */
const CodeEditor: React.FC<{
  code: string[];
  visibleLines: number;
  highlightedLine?: number;
  fileName?: string;
}> = ({ code, visibleLines, highlightedLine, fileName = "example.ts" }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        backgroundColor: "#1E1E1E",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        width: 900,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          backgroundColor: "#323232",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Window buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FF5F56",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FFBD2E",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#27C93F",
            }}
          />
        </div>

        {/* File name */}
        <span
          style={{
            color: "#9DA5B4",
            fontSize: 14,
            fontFamily: "system-ui",
            marginLeft: 12,
          }}
        >
          {fileName}
        </span>
      </div>

      {/* Code content */}
      <div style={{ padding: "16px 0" }}>
        {code.slice(0, visibleLines).map((line, index) => (
          <CodeLine
            key={index}
            lineNumber={index + 1}
            code={line}
            isHighlighted={highlightedLine === index + 1}
            isVisible={index < visibleLines}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Typing Cursor Component
 */
const TypingCursor: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = Math.sin(frame / 5) > 0 ? 1 : 0;

  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: 20,
        backgroundColor: "#528BFF",
        opacity,
        marginLeft: 2,
      }}
    />
  );
};

/**
 * Explanation Panel Component
 */
const ExplanationPanel: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, 20], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        border: "1px solid #3E4451",
        borderRadius: 12,
        padding: "24px 32px",
        maxWidth: 400,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <h3
        style={{
          color: "#61AFEF",
          fontSize: 22,
          fontWeight: 600,
          fontFamily: "system-ui",
          margin: 0,
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#ABB2BF",
          fontSize: 16,
          fontFamily: "system-ui",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const CodeVideoDemo: React.FC<CodeVideoDemoProps> = ({ language, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sample code to display
  const sampleCode = [
    "// Creating videos with Remotion",
    "import { useCurrentFrame } from 'remotion';",
    "",
    "export const MyVideo = () => {",
    "  const frame = useCurrentFrame();",
    "  ",
    "  // Calculate opacity based on frame",
    "  const opacity = frame / 30;",
    "  ",
    "  return (",
    "    <div style={{ opacity }}>",
    "      <h1>Hello, Remotion!</h1>",
    "    </div>",
    "  );",
    "};",
  ];

  // Calculate which lines are visible (typing effect)
  const linesPerSecond = 2;
  const visibleLines = Math.min(
    Math.floor((frame / fps) * linesPerSecond) + 1,
    sampleCode.length
  );

  // Highlight different lines at different times
  const highlightedLine =
    frame < 60 ? undefined :
    frame < 120 ? 2 :
    frame < 180 ? 5 :
    frame < 240 ? 8 :
    frame < 300 ? 11 :
    undefined;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#282C34",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(97, 175, 239, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(198, 120, 221, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Title */}
      <Sequence from={0} durationInFrames={90}>
        <h1
          style={{
            position: "absolute",
            top: 50,
            color: "white",
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "system-ui",
          }}
        >
          Programming with Remotion
        </h1>
      </Sequence>

      {/* Code Editor */}
      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        <CodeEditor
          code={sampleCode}
          visibleLines={visibleLines}
          highlightedLine={highlightedLine}
          fileName="MyVideo.tsx"
        />

        {/* Explanation panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Sequence from={60} durationInFrames={60}>
            <ExplanationPanel
              title="Import Hook"
              description="useCurrentFrame() returns the current frame number, enabling frame-based animations."
            />
          </Sequence>

          <Sequence from={120} durationInFrames={60}>
            <ExplanationPanel
              title="Get Frame"
              description="Call the hook inside your component to access the current frame."
            />
          </Sequence>

          <Sequence from={180} durationInFrames={60}>
            <ExplanationPanel
              title="Calculate Values"
              description="Use the frame to calculate animated properties like opacity, position, or scale."
            />
          </Sequence>

          <Sequence from={240} durationInFrames={60}>
            <ExplanationPanel
              title="Apply Styles"
              description="Apply the calculated values to your JSX elements using inline styles."
            />
          </Sequence>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          color: "rgba(255,255,255,0.5)",
          fontSize: 16,
          fontFamily: "monospace",
        }}
      >
        Language: {language} | Theme: {theme}
      </div>
    </AbsoluteFill>
  );
};
