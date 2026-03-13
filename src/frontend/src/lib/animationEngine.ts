import type { AnimationPreset, StyleSettings } from "../types";

// --- Easing functions ---
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function bounceOut(input: number): number {
  let t = input;
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) {
    t -= 1.5 / 2.75;
    return 7.5625 * t * t + 0.75;
  }
  if (t < 2.5 / 2.75) {
    t -= 2.25 / 2.75;
    return 7.5625 * t * t + 0.9375;
  }
  t -= 2.625 / 2.75;
  return 7.5625 * t * t + 0.984375;
}

function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t;
  return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

// --- Draw grid background ---
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,200,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  ctx.restore();
}

function setupTextStyle(
  ctx: CanvasRenderingContext2D,
  style: StyleSettings,
  opacity: number,
): void {
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.font = `bold ${style.fontSize}px "${style.fontFamily}", sans-serif`;
  ctx.textAlign = style.textAlign;
  ctx.textBaseline = "middle";
  ctx.fillStyle = style.textColor;
}

function drawTextWithStyle(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: StyleSettings,
): void {
  if (style.backgroundType !== "none") {
    const metrics = ctx.measureText(text);
    const pad = 20;
    const bgX =
      style.textAlign === "center"
        ? x - metrics.width / 2 - pad
        : style.textAlign === "right"
          ? x - metrics.width - pad
          : x - pad;
    const bgY = y - style.fontSize * 0.7;
    const bgW = metrics.width + pad * 2;
    const bgH = style.fontSize * 1.4;
    if (style.backgroundType === "blur") {
      ctx.save();
      ctx.filter = "blur(8px)";
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(bgX, bgY, bgW, bgH);
      ctx.filter = "none";
      ctx.restore();
    }
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(bgX, bgY, bgW, bgH);
    ctx.fillStyle = style.textColor;
  }

  if (style.shadowEnabled) {
    ctx.shadowBlur = style.shadowBlur;
    ctx.shadowOffsetX = style.shadowOffsetX;
    ctx.shadowOffsetY = style.shadowOffsetY;
    ctx.shadowColor = "rgba(0,0,0,0.9)";
  }

  if (style.strokeWidth > 0) {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
  }

  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawCharByChar(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  style: StyleSettings,
  getCharOffset: (
    i: number,
    total: number,
    progress: number,
  ) => {
    dx: number;
    dy: number;
    scale?: number;
    opacity?: number;
    rotation?: number;
  },
  progress: number,
): void {
  const charWidths: number[] = [];
  let totalWidth = 0;
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    charWidths.push(w);
    totalWidth += w;
  }

  const startX =
    style.textAlign === "center"
      ? cx - totalWidth / 2
      : style.textAlign === "right"
        ? cx - totalWidth
        : cx;

  let charX = startX;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const charCx = charX + charWidths[i] / 2;
    const offset = getCharOffset(i, text.length, progress);
    const charOpacity = offset.opacity !== undefined ? offset.opacity : 1;
    const charScale = offset.scale !== undefined ? offset.scale : 1;
    const charRotation = offset.rotation !== undefined ? offset.rotation : 0;

    ctx.save();
    ctx.translate(charCx + offset.dx, cy + offset.dy);
    if (charRotation !== 0) ctx.rotate(charRotation);
    if (charScale !== 1) ctx.scale(charScale, charScale);
    ctx.globalAlpha = Math.max(0, Math.min(1, ctx.globalAlpha * charOpacity));
    ctx.textAlign = "center";

    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth * 2;
      ctx.lineJoin = "round";
      ctx.strokeText(ch, 0, 0);
    }
    ctx.fillText(ch, 0, 0);
    ctx.restore();

    charX += charWidths[i];
  }
}

export interface DrawFrameOptions {
  text: string;
  progress: number;
  outProgress: number;
  animation: AnimationPreset;
  style: StyleSettings;
  canvasWidth: number;
  canvasHeight: number;
  timestamp: number;
}

export function drawAnimationFrame(
  ctx: CanvasRenderingContext2D,
  opts: DrawFrameOptions,
): void {
  const {
    text,
    progress,
    outProgress,
    animation,
    style,
    canvasWidth: W,
    canvasHeight: H,
    timestamp,
  } = opts;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  if (progress <= 0) return;

  const p = Math.min(progress, 1);
  const fadeAlpha = 1 - outProgress;
  const cx = W / 2;
  const cy = H / 2;
  const textX =
    style.textAlign === "center"
      ? cx
      : style.textAlign === "right"
        ? W - 60
        : 60;

  setupTextStyle(ctx, style, fadeAlpha);

  switch (animation) {
    case "fade-in": {
      ctx.globalAlpha = easeInOut(p) * fadeAlpha;
      drawTextWithStyle(ctx, text, textX, cy, style);
      break;
    }
    case "slide-up": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(0, (1 - ep) * 50);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "slide-down": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(0, -(1 - ep) * 50);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "slide-left": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate((1 - ep) * 80, 0);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "slide-right": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(-(1 - ep) * 80, 0);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "typewriter": {
      const visibleText = text.slice(0, Math.ceil(p * text.length));
      ctx.globalAlpha = fadeAlpha;
      drawTextWithStyle(ctx, visibleText, textX, cy, style);
      if (p < 1) {
        const metrics = ctx.measureText(visibleText);
        const cursorX =
          style.textAlign === "center"
            ? textX + metrics.width / 2 + 4
            : textX + metrics.width + 4;
        if (Math.floor(timestamp / 500) % 2 === 0) {
          ctx.fillStyle = style.textColor;
          ctx.globalAlpha = fadeAlpha;
          ctx.fillRect(cursorX, cy - style.fontSize * 0.5, 3, style.fontSize);
        }
      }
      break;
    }
    case "bounce": {
      const bp = bounceOut(p);
      ctx.globalAlpha = Math.min(1, p * 3) * fadeAlpha;
      ctx.save();
      ctx.translate(0, (1 - bp) * 60);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "zoom-in": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.3 + ep * 0.7, 0.3 + ep * 0.7);
      ctx.translate(-cx, -cy);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "zoom-out": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.8 - ep * 0.8, 1.8 - ep * 0.8);
      ctx.translate(-cx, -cy);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "blur-in": {
      const ep = easeInOut(p);
      const blur = (1 - ep) * 24;
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.filter = blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : "none";
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.filter = "none";
      ctx.restore();
      break;
    }
    case "glitch": {
      ctx.globalAlpha = fadeAlpha;
      const flicker = Math.sin(timestamp * 0.047) > 0.3;
      drawTextWithStyle(ctx, text, textX, cy, style);
      if (flicker) {
        const gx = (Math.random() - 0.5) * 12;
        const gy = (Math.random() - 0.5) * 6;
        ctx.save();
        ctx.globalAlpha = 0.6 * fadeAlpha;
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "#ff0044";
        ctx.strokeStyle = "#ff0044";
        ctx.translate(gx, gy);
        ctx.fillText(text, textX, cy);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.5 * fadeAlpha;
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "#00ffff";
        ctx.strokeStyle = "#00ffff";
        ctx.translate(-gx * 0.5, -gy * 0.5);
        ctx.fillText(text, textX, cy);
        ctx.restore();
      }
      break;
    }
    case "wave": {
      ctx.globalAlpha = fadeAlpha;
      setupTextStyle(ctx, style, fadeAlpha);
      drawCharByChar(
        ctx,
        text,
        cx,
        cy,
        style,
        (i) => {
          return { dx: 0, dy: Math.sin(timestamp * 0.004 + i * 0.6) * 14 };
        },
        p,
      );
      break;
    }
    case "flip-x": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ep);
      ctx.translate(-cx, -cy);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "rotate-in": {
      const ep = easeInOut(p);
      ctx.globalAlpha = ep * fadeAlpha;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((1 - ep) * -0.3);
      ctx.translate(-cx, -cy);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "elastic": {
      const ep = elasticOut(p);
      ctx.globalAlpha = Math.min(1, p * 4) * fadeAlpha;
      ctx.save();
      ctx.translate(0, (1 - ep) * 60);
      drawTextWithStyle(ctx, text, textX, cy, style);
      ctx.restore();
      break;
    }
    case "split": {
      ctx.globalAlpha = fadeAlpha;
      setupTextStyle(ctx, style, fadeAlpha);
      drawCharByChar(
        ctx,
        text,
        cx,
        cy,
        style,
        (i, _total, prog) => {
          const ep = easeInOut(prog);
          const direction = i % 2 === 0 ? -1 : 1;
          return { dx: 0, dy: direction * (1 - ep) * 50, opacity: ep };
        },
        p,
      );
      break;
    }
    default: {
      ctx.globalAlpha = easeInOut(p) * fadeAlpha;
      drawTextWithStyle(ctx, text, textX, cy, style);
    }
  }

  ctx.globalAlpha = 1;
}

export function computeSegmentProgress(
  elapsedMs: number,
  durationMs: number,
): { inProgress: number; outProgress: number; isActive: boolean } {
  if (elapsedMs < 0 || elapsedMs >= durationMs) {
    return { inProgress: 0, outProgress: 0, isActive: false };
  }
  const inDuration = Math.min(600, durationMs * 0.4);
  const outDuration = Math.min(300, durationMs * 0.12);
  const outStart = durationMs - outDuration;
  const inProgress = elapsedMs < inDuration ? elapsedMs / inDuration : 1;
  const outProgress =
    elapsedMs >= outStart ? (elapsedMs - outStart) / outDuration : 0;
  return { inProgress, outProgress, isActive: true };
}
