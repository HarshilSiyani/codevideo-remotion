# Vizmo - AI Video Generation Platform

## Vision

Build "Lovable for videos" - an AI-powered platform where users describe a video in natural language and get a professional motion graphics video rendered automatically. No templates, no editing skills required.

**Target:** $20k MRR with 1000 users generating ~10 videos/month each (10,000 videos/month).

---

## What We're Building

### User Flow
1. User enters a prompt: "Create a 30-second explainer about why the sky is blue"
2. AI generates a script (hook, main points, conclusion)
3. AI creates video configuration (scenes, backgrounds, text animations, transitions)
4. Video renders with motion graphics, kinetic typography, and smooth transitions
5. User can preview, download, or iterate with follow-up prompts

### Key Features (V1)
- **No templates**: Every video is uniquely generated based on the prompt
- **Motion graphics only**: Animated text, gradients, particles, transitions (no AI images for V1)
- **60 seconds max**: Short-form content focus (TikTok, Reels, YouTube Shorts)
- **Voiceover ready**: ElevenLabs integration for AI narration
- **Multiple formats**: Landscape (1920x1080), Portrait (1080x1920), Square (1080x1080)

---

## Current Architecture

```
vizmo/
├── apps/
│   └── web/                    # Next.js 14 frontend
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── create/         # Video creation flow
│       │   └── api/
│       │       ├── generate/
│       │       │   ├── script/     # Claude Haiku - script generation
│       │       │   ├── config/     # Claude Sonnet - video config
│       │       │   └── voiceover/  # ElevenLabs TTS
│       │       └── render/         # Local Remotion rendering
│       ├── components/
│       │   └── VideoPlayer.tsx # Remotion Player wrapper
│       └── lib/
│           └── db/             # SQLite + Drizzle ORM
│
├── packages/
│   ├── remotion/               # Video rendering engine
│   │   └── src/
│   │       ├── compositions/
│   │       │   └── DynamicVideo.tsx  # Main video component
│   │       └── components/
│   │           ├── backgrounds/      # Gradient, Particles, Grid, Solid
│   │           ├── text/             # Title, Fade, Typewriter, Kinetic, Glitch
│   │           ├── data/             # Counter, ProgressBar
│   │           └── transitions/      # Fade, Glitch, Zoom, Wipe
│   │
│   └── ai/                     # AI prompt engineering
│       └── src/prompts/
│           └── system.ts       # Script & video config prompts
│
└── docs/
    └── AWS_SETUP.md           # Lambda deployment guide (optional)
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Video Engine | Remotion 4, @remotion/transitions, @remotion/player |
| AI | Claude API (Haiku for scripts, Sonnet for configs) |
| Voice | ElevenLabs API (optional) |
| Database | SQLite + Drizzle ORM (local dev) |
| Rendering | Local Remotion CLI (dev), AWS Lambda (prod - optional) |

---

## Current State

### Working ✅
- Landing page with prompt input
- Script generation via Claude Haiku
- Video config generation via Claude Sonnet
- Remotion component library (backgrounds, text animations, transitions)
- In-browser video preview with Remotion Player
- Local video rendering via Remotion CLI
- SQLite database schema ready

### Needs Work 🔧
1. **Video quality**: Text overlapping, animations need polish
2. **Rendering pipeline**: Local rendering is slow, need better queue system
3. **User authentication**: No auth yet (Supabase/Clerk needed for prod)
4. **Voiceover sync**: ElevenLabs integration exists but not connected to video
5. **Download flow**: Render completes but download UX needs work
6. **Error handling**: Better error messages and retry logic
7. **Iteration**: "Edit this video" follow-up prompts not implemented

---

## Video Config Schema

The AI generates this JSON, and Remotion renders it:

```typescript
{
  title: string;
  duration: number;           // Total seconds
  fps: 30;
  scenes: [
    {
      id: string;
      duration: number;       // Scene duration in seconds
      background: {
        type: "solid" | "gradient" | "particles" | "grid";
        colors?: string[];    // For gradient
        color?: string;       // For solid/particles/grid
        animated?: boolean;
      };
      elements: [
        {
          type: "title" | "fade" | "typewriter" | "kinetic" | "glitch";
          text: string;
          fontSize: number;
          color: string;
          position: "top" | "center" | "bottom";
          style?: "bounce" | "wave" | "pop" | "slam";  // For kinetic
        }
      ];
      transition: "fade" | "slide" | "wipe" | "none";
    }
  ];
  audio?: {
    voiceover?: { url: string; volume: number };
    music?: { url: string; volume: number };
  };
}
```

---

## Key Files to Understand

| File | Purpose |
|------|---------|
| `packages/ai/src/prompts/system.ts` | AI prompts that control video generation quality |
| `packages/remotion/src/compositions/DynamicVideo.tsx` | Main Remotion component that renders videos |
| `apps/web/app/api/generate/config/route.ts` | API that calls Claude to generate video config |
| `apps/web/app/api/render/route.ts` | API that triggers Remotion rendering |
| `apps/web/app/create/page.tsx` | Video creation UI flow |

---

## Environment Variables

Create `apps/web/.env.local`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
ELEVENLABS_API_KEY=...
DATABASE_PATH=./vizmo.db
```

---

## How to Run

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Open http://localhost:3000
```

---

## Scaling to 1000 Users

### Current Limitations
- Local rendering: 1 video at a time, blocks the server
- No auth: Can't track user usage or credits
- No queue: Videos fail if multiple users submit simultaneously

### Required for Production

1. **Rendering Queue**
   - BullMQ or similar job queue
   - Multiple render workers
   - Progress tracking via WebSocket or polling

2. **Cloud Rendering** (choose one)
   - AWS Lambda via Remotion Lambda (if you have AWS org access)
   - Render.com background workers
   - Modal.com serverless functions
   - Self-hosted on dedicated VPS

3. **Authentication**
   - Clerk or Supabase Auth
   - User credits/subscription tracking
   - Rate limiting

4. **Storage**
   - S3 or Cloudflare R2 for rendered videos
   - CDN for fast delivery

5. **Database**
   - Migrate SQLite → PostgreSQL (Supabase/Neon)
   - Track projects, renders, usage

### Estimated Infrastructure Costs (10,000 videos/month)

| Component | Cost |
|-----------|------|
| Rendering (Lambda or VPS) | $500-1500/mo |
| Claude API | $200-400/mo |
| ElevenLabs | $100-300/mo |
| Storage (S3) | $50-100/mo |
| Database | $25-50/mo |
| **Total** | **~$1000-2500/mo** |

At $20/user/month → 1000 users = $20k MRR → ~$17k profit

---

## Immediate Priorities

### Priority 1: Fix Video Quality
The current videos have overlapping text and poor timing. The prompts in `packages/ai/src/prompts/system.ts` need refinement. Key rules:
- ONE text element per scene
- 3-6 second scenes
- Use TransitionSeries for smooth transitions

### Priority 2: Reliable Rendering
Replace the current spawn-based local rendering with a proper queue system.

### Priority 3: User Flow Polish
- Show render progress
- Proper download button
- Error states and retry

### Priority 4: Authentication
Add Clerk or Supabase Auth so users can:
- Save their videos
- Track usage
- Subscribe for more credits

---

## Claude Code Instructions

When working on this codebase:

1. **Read the Remotion Skills docs**: https://www.remotion.dev/docs/ai/skills
2. **Use frame-based animations**: All animations must use `useCurrentFrame()` hook
3. **No CSS animations**: Remotion requires declarative, frame-based animation
4. **Test with Remotion Studio**: Run `npm run studio` in packages/remotion to preview
5. **Keep scenes simple**: ONE main text element per scene for clean visuals
6. **Use TransitionSeries**: For smooth scene-to-scene transitions

---

## Commands Reference

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run studio                 # Open Remotion Studio (preview videos)

# Database
npm run db:studio              # Open Drizzle Studio (view SQLite)

# Rendering
cd packages/remotion
npm run render                 # Render a test video

# Type checking
npm run type-check
```

---

## Links

- [Remotion Documentation](https://www.remotion.dev/docs)
- [Remotion Skills (AI Guide)](https://www.remotion.dev/docs/ai/skills)
- [Remotion Transitions](https://www.remotion.dev/docs/transitions)
- [Claude API](https://docs.anthropic.com/claude/reference)
- [ElevenLabs API](https://elevenlabs.io/docs)
