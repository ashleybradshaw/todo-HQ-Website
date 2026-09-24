"use client";

/**
 * Landing hawk — video-driven WebGL ASCII (matched ping-pong look).
 * Shader + constants from the approved reference base mode.
 * Poster paints through the shader first; video starts right after (short idle yield).
 */

import { useEffect, useRef, useState } from "react";
import {
  HAWK_ACCENT_RATE,
  HAWK_CHARSET,
  HAWK_GLYPH_ALPHA,
  HAWK_LOAD_TIMEOUT_MS,
  HAWK_LUMA_SKIP,
  HAWK_VIDEO_FPS,
  HAWK_VIDEO_MP4,
  HAWK_VIDEO_POSTER,
  HAWK_VIDEO_WEBM,
  atlasCoverLayout,
  hawkAtlasGrid,
  hawkNeedsReducedFps,
} from "@/lib/ascii-hawk";

type HawkVideoAsciiProps = {
  onFallback?: () => void;
};

const VS = `attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.,1.);}`;

/** Matched base-mode fragment — square then glyph, violet accent @8%. */
const FS = `precision highp float;
uniform sampler2D uVid,uGlyph;
uniform vec2 uRes,uVidSize,uGrid;
uniform vec4 uLayout;
uniform float uSkip,uAlpha,uN,uAccentRate;
varying vec2 v;
float luma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 pix=v*uRes;
  float cellW=uLayout.x, cellH=uLayout.y, ox=uLayout.z, oy=uLayout.w;
  float cx=floor((pix.x-ox)/cellW);
  float cy=floor((pix.y-oy)/cellH);
  if(cx<0.||cy<0.||cx>=uGrid.x||cy>=uGrid.y){gl_FragColor=vec4(69./255.,69./255.,1.,1.);return;}
  vec2 local=vec2((pix.x-ox)/cellW-cx,(pix.y-oy)/cellH-cy);
  float sFit=max(uGrid.x/uVidSize.x, uGrid.y/uVidSize.y);
  vec2 vs=uVidSize*sFit;
  vec2 off=(uGrid-vs)*0.5;
  vec2 vu=(vec2(cx+0.5, cy+0.5)-off)/vs;
  if(vu.x<0.||vu.x>1.||vu.y<0.||vu.y>1.){gl_FragColor=vec4(69./255.,69./255.,1.,1.);return;}
  vec2 tuv=vec2(vu.x, 1.-vu.y);
  float L0=luma(texture2D(uVid, tuv).rgb);
  float s = L0<=0.18 ? 0. : pow(min(1., (L0-0.18)/0.52), 0.55);
  s = min(1., pow(s, 0.88)*1.06);
  if(s<uSkip){gl_FragColor=vec4(69./255.,69./255.,1.,1.);return;}
  float gi=floor(s*(uN-0.0001));
  bool accent = hash21(vec2(cx,cy)) < uAccentRate && s>0.05;
  vec3 col = accent ? vec3(0.65490196,0.54509804,0.98039216)
    : (s<0.28 ? vec3(0.77647059,0.77647059,1.)
    : s<0.72 ? vec3(0.86666667,0.86666667,1.)
    : vec3(0.94117647,0.94117647,1.));
  float alpha = uAlpha * (0.88 + 0.12*s);
  float minC=min(cellW,cellH);
  float markPx=max(1.6, minC*(0.62+0.4*s));
  float hm=markPx/minC*0.5;
  vec2 d=local-0.5;
  float inSq = (abs(d.x) <= hm && abs(d.y) <= hm) ? 1. : 0.;
  float gA=0.;
  if(minC>=2.4 && gi>=2.){
    vec2 gu=vec2((gi+local.x)/uN, local.y);
    gA=texture2D(uGlyph, gu).a;
  }
  float aSq = inSq * alpha;
  float aGl = gA * alpha;
  float a = 1.0 - (1.0 - aSq) * (1.0 - aGl);
  vec3 bg=vec3(69./255.,69./255.,1.);
  gl_FragColor=vec4(mix(bg,col,clamp(a,0.,1.)),1.);
}`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("shader create failed");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "compile error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function linkProgram(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  if (!prog) {
    throw new Error("program create failed");
  }
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog) || "link error";
    gl.deleteProgram(prog);
    throw new Error(log);
  }
  return prog;
}

function buildGlyphAtlas(charset: string) {
  const cell = 64;
  const n = charset.length;
  const c = document.createElement("canvas");
  c.width = cell * n;
  c.height = cell;
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("glyph atlas 2d missing");
  }
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 48px var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace`;
  for (let i = 0; i < n; i += 1) {
    const ch = charset[i];
    if (!ch || ch === " ") {
      continue;
    }
    ctx.fillText(ch, i * cell + cell / 2, cell / 2 + 2);
  }
  return c;
}

function scheduleIdle(cb: () => void, timeoutMs: number) {
  const ric = window.requestIdleCallback;
  if (typeof ric === "function") {
    return ric(() => cb(), { timeout: timeoutMs });
  }
  return window.setTimeout(cb, timeoutMs);
}

function cancelIdle(handle: number) {
  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
}

export function HawkVideoAscii({ onFallback }: HawkVideoAsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onFallbackRef = useRef(onFallback);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    onFallbackRef.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      onFallbackRef.current?.();
      return;
    }

    let disposed = false;
    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let texV: WebGLTexture | null = null;
    let texG: WebGLTexture | null = null;
    let ready = false;
    let running = false;
    let raf = 0;
    let lastRaf = 0;
    let lastDrawMs = 0;
    let useRVFC = false;
    let lastVidT = -1;
    let gotFrame = false;
    let loadTimeout = 0;
    let idleHandle = 0;
    let posterW = 480;
    let posterH = 270;
    let usingPoster = true;
    let layout = {
      cellW: 1,
      cellH: 1,
      ox: 0,
      oy: 0,
      W: 1,
      H: 1,
      cols: 400,
      rows: 225,
    };

    const uniforms: Record<string, WebGLUniformLocation | null> = {};

    const fail = () => {
      if (disposed) {
        return;
      }
      disposed = true;
      stop();
      window.clearTimeout(loadTimeout);
      onFallbackRef.current?.();
    };

    const markReady = () => {
      if (gotFrame) {
        return;
      }
      gotFrame = true;
      window.clearTimeout(loadTimeout);
      setVisible(true);
    };

    const stop = () => {
      running = false;
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const resize = () => {
      const dprCap = hawkNeedsReducedFps() ? 1 : 1.75;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
      const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);
      const W = Math.max(1, Math.floor(cssW * dpr));
      const H = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      if (gl) {
        gl.viewport(0, 0, W, H);
      }
      const { cols, rows, fillViewport } = hawkAtlasGrid(cssW, cssH);
      if (fillViewport) {
        layout = {
          cellW: W / cols,
          cellH: H / rows,
          ox: 0,
          oy: 0,
          W,
          H,
          cols,
          rows,
        };
      } else {
        const L = atlasCoverLayout(cols, rows, W, H);
        layout = { ...L, W, H, cols, rows };
      }
    };

    const draw = () => {
      if (!gl || !prog || !ready || disposed) {
        return;
      }
      const { W, H, cellW, cellH, ox, oy, cols, rows } = layout;
      const vw = usingPoster ? posterW : video.videoWidth || posterW;
      const vh = usingPoster ? posterH : video.videoHeight || posterH;

      gl.clearColor(69 / 255, 69 / 255, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(uniforms.uRes, W, H);
      gl.uniform2f(uniforms.uVidSize, vw, vh);
      gl.uniform2f(uniforms.uGrid, cols, rows);
      gl.uniform4f(uniforms.uLayout, cellW, cellH, ox, oy);
      gl.uniform1f(uniforms.uSkip, HAWK_LUMA_SKIP);
      gl.uniform1f(uniforms.uAlpha, HAWK_GLYPH_ALPHA);
      gl.uniform1f(uniforms.uN, HAWK_CHARSET.length);
      gl.uniform1f(uniforms.uAccentRate, HAWK_ACCENT_RATE);

      if (!usingPoster && video.readyState >= 2 && texV) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texV);
        const vt = video.currentTime;
        if (vt !== lastVidT) {
          lastVidT = vt;
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video,
          );
        }
      }

      if (texG) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texG);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const uploadImage = (
      img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      w: number,
      h: number,
    ) => {
      if (!gl || !texV) {
        return;
      }
      posterW = Math.max(1, w);
      posterH = Math.max(1, h);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texV);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      lastVidT = -1;
    };

    const onVF = () => {
      if (!running || disposed) {
        return;
      }
      const now = performance.now();
      const minDt = 1000 / HAWK_VIDEO_FPS;
      if (now - lastDrawMs >= minDt - 1) {
        lastDrawMs = now;
        draw();
      }
      try {
        video.requestVideoFrameCallback(onVF);
      } catch {
        /* ignore */
      }
    };

    const onRaf = (t: number) => {
      if (!running || disposed) {
        return;
      }
      const minDt = 1000 / HAWK_VIDEO_FPS;
      if (t - lastRaf >= minDt - 1) {
        lastRaf = t;
        draw();
      }
      raf = window.requestAnimationFrame(onRaf);
    };

    const start = () => {
      if (running || disposed || document.hidden) {
        return;
      }
      running = true;
      lastRaf = 0;
      if (useRVFC && !usingPoster) {
        try {
          video.requestVideoFrameCallback(onVF);
        } catch {
          useRVFC = false;
          raf = window.requestAnimationFrame(onRaf);
        }
      } else {
        raf = window.requestAnimationFrame(onRaf);
      }
    };

    const initGL = async () => {
      try {
        await document.fonts.load(
          '700 48px var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace',
        );
      } catch {
        /* fonts optional — atlas still builds with fallbacks */
      }

      const ctx = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      });
      if (!ctx) {
        throw new Error("webgl missing");
      }
      gl = ctx;
      prog = linkProgram(gl, VS, FS);

      const names = [
        "uVid",
        "uGlyph",
        "uRes",
        "uVidSize",
        "uGrid",
        "uLayout",
        "uSkip",
        "uAlpha",
        "uN",
        "uAccentRate",
      ] as const;
      for (const name of names) {
        uniforms[name] = gl.getUniformLocation(prog, name);
      }

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const atlas = buildGlyphAtlas(HAWK_CHARSET);
      texG = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texG);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);

      texV = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texV);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]),
      );

      gl.useProgram(prog);
      gl.uniform1i(uniforms.uVid, 0);
      gl.uniform1i(uniforms.uGlyph, 1);

      useRVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
      resize();
      ready = true;
    };

    const paintPoster = () =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (disposed) {
            resolve();
            return;
          }
          usingPoster = true;
          uploadImage(img, img.naturalWidth || 480, img.naturalHeight || 270);
          draw();
          markReady();
          resolve();
        };
        img.onerror = () => reject(new Error("poster load failed"));
        img.src = HAWK_VIDEO_POSTER;
      });

    const startVideo = async () => {
      if (disposed) {
        return;
      }
      loadTimeout = window.setTimeout(() => {
        if (usingPoster) {
          fail();
        }
      }, HAWK_LOAD_TIMEOUT_MS);

      video.preload = "auto";
      video.load();

      try {
        await video.play();
      } catch {
        fail();
        return;
      }

      if (disposed) {
        return;
      }

      const switchToVideo = () => {
        if (disposed) {
          return;
        }
        usingPoster = false;
        lastVidT = -1;
        if (gl && texV && video.readyState >= 2) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texV);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video,
          );
          lastVidT = video.currentTime;
        }
        draw();
        markReady();
        window.clearTimeout(loadTimeout);
        stop();
        start();
      };

      if (video.readyState >= 2) {
        switchToVideo();
      } else {
        video.addEventListener("loadeddata", switchToVideo, { once: true });
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        video.pause();
        return;
      }
      if (!usingPoster) {
        void video.play().catch(() => fail());
      }
      start();
    };

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });

    const boot = async () => {
      try {
        await initGL();
        await paintPoster();
        stop();
      } catch {
        fail();
        return;
      }

      // Yield briefly so first paint can commit, then start video — no window-load / 1200ms gate.
      idleHandle = scheduleIdle(() => {
        void startVideo();
      }, 100) as number;
    };

    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    void boot();

    return () => {
      disposed = true;
      window.clearTimeout(loadTimeout);
      cancelIdle(idleHandle);
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
      if (gl && prog) {
        gl.deleteProgram(prog);
      }
      if (gl && texV) {
        gl.deleteTexture(texV);
      }
      if (gl && texG) {
        gl.deleteTexture(texG);
      }
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute h-px w-px opacity-0"
      >
        <source src={HAWK_VIDEO_WEBM} type="video/webm" />
        <source src={HAWK_VIDEO_MP4} type="video/mp4" />
      </video>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-[400ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
