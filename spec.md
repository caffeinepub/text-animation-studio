# Text Animation Studio

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- Text input panel: paste or type text, auto-split into segments by sentence/word/line
- Sequence editor: reorder segments via drag-and-drop, set in/out timing per segment
- Animation presets: 15+ modern animations (fade, slide up/down/left/right, typewriter, bounce, zoom, blur-in, glitch, wave, flip, rotate, elastic, split)
- Speed control: global BPM/speed slider + per-segment duration override
- Sound effects panel: select from built-in whoosh, pop, swipe, glitch, cinematic FX per segment
- Transition effects: cut, crossfade, wipe, push, zoom transition between segments
- Live canvas preview: real-time animation preview with play/pause/scrub
- Export panel:
  - SRT/VTT subtitle file (timed captions for DaVinci/Premiere)
  - EDL (Edit Decision List) with timing
  - WebM transparent video via canvas recording (for overlay in NLEs)
  - JSON animation data
- Style controls: font, size, color, shadow, outline, background box

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store animation projects (segments, timings, style settings)
2. Frontend:
   - Layout: left sidebar (text input + segments), center canvas preview, right panel (style/animation/export)
   - Segment editor with drag reorder
   - Canvas-based animation renderer using requestAnimationFrame
   - Animation engine with 15+ presets using CSS transform/opacity interpolation
   - Export: SRT generator, WebM recorder via MediaRecorder API
   - Sound effects via Web Audio API (generated tones/noise for FX)
