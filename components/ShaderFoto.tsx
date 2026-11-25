"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Foto com shader WebGL:
 * - ondulação da água abaixo da "linha d'água" da foto, com reflexos dourados;
 * - feixe de luz dourada que atravessa a imagem devagar;
 * - parallax pela rolagem e um leve zoom;
 * - onda que segue o cursor (ou o toque) na água.
 * A <img> fica por baixo: aparece antes do WebGL carregar e é o fallback
 * quando não há WebGL ou quando o usuário prefere menos movimento.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uFoco;
uniform vec2 uMouse;
uniform float uMouseForca;
uniform float uTempo;
uniform float uAgua;
uniform float uScroll;
uniform float uZoom;
uniform float uBrilho;
uniform float uLiquido;
uniform vec4 uGotas[10]; // x, y, nascimento (s), força
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main(){
  // tela (0 = topo) -> imagem, como object-fit: cover com ponto focal
  vec2 tela = vec2(vUv.x, 1.0 - vUv.y);
  float rt = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rt > ri ? vec2(1.0, ri / rt) : vec2(rt / ri, 1.0);
  s /= uZoom;
  vec2 o = (1.0 - s) * uFoco;
  o.y = clamp(o.y + uScroll * (1.0 - s.y) * 0.9, 0.0, 1.0 - s.y);
  vec2 uv = tela * s + o;

  // água: ondulação que cresce a partir da linha d'água
  float prof = uv.y - uAgua;
  float naAgua = smoothstep(0.0, 0.025, prof);
  float t = uTempo;
  vec2 desl = vec2(
    sin(uv.y * 140.0 - t * 1.6 + sin(uv.x * 18.0 + t * 0.7) * 2.2) * 0.0026,
    sin(uv.x * 46.0 + t * 1.1) * 0.0012
  ) * naAgua * (0.6 + prof * 6.0);

  // onda do cursor
  vec2 dm = (tela - uMouse) * vec2(rt, 1.0);
  float dist = length(dm);
  float anel = sin(dist * 70.0 - t * 6.0) * exp(-dist * 9.0) * uMouseForca;
  desl += normalize(dm + 1e-5) * anel * 0.006 * (0.35 + naAgua);

  // líquido: corrente lenta na cena toda (mais forte na água) e gotas que se expandem
  float luz = 0.0;
  if (uLiquido > 0.0) {
    vec2 p = vec2(tela.x * rt, tela.y) * 2.4;
    vec2 q = vec2(ruido(p + vec2(t * 0.16, -t * 0.11)), ruido(p + vec2(5.2 - t * 0.13, 1.3 + t * 0.15)));
    vec2 w = vec2(ruido(p * 1.5 + q * 2.6 + t * 0.12), ruido(p * 1.5 + q * 2.6 + vec2(8.3, 2.8) - t * 0.1)) - 0.5;
    float base = mix(0.010, 0.034, naAgua);
    desl += w * base * uLiquido;
    luz += (w.x + w.y) * naAgua * 0.30;
    vec2 pos = vec2(tela.x * rt, tela.y);
    for (int i = 0; i < 10; i++) {
      float idade = t - uGotas[i].z;
      if (uGotas[i].w <= 0.0 || idade < 0.0 || idade > 3.2) continue;
      vec2 d = pos - vec2(uGotas[i].x * rt, uGotas[i].y);
      float r = length(d);
      float frente = r - idade * 0.24;
      float onda = sin(frente * 46.0) * exp(-frente * frente * 110.0) * uGotas[i].w * exp(-idade * 1.35) * smoothstep(0.0, 0.12, idade);
      vec2 dir = d / (r + 1e-4);
      desl += dir * onda * mix(0.008, 0.02, naAgua) * uLiquido;
      luz += dot(dir, vec2(-0.6, -0.8)) * onda * 0.5;
    }
  }

  // leve separação de cor nas cristas, como refração
  vec2 ab = desl * 0.10 * uLiquido;
  vec3 cor = vec3(texture2D(uTex, uv + desl + ab).r, texture2D(uTex, uv + desl).g, texture2D(uTex, uv + desl - ab).b);
  cor += (luz > 0.0 ? vec3(0.91, 0.87, 0.74) * luz * 0.55 : vec3(luz * 0.22)) * uLiquido;

  // reflexos dourados na água
  float cintila = ruido(vec2(uv.x * 220.0, uv.y * 60.0 - t * 0.8)) * ruido(vec2(uv.x * 90.0 + t * 0.3, uv.y * 180.0));
  cor += vec3(0.95, 0.82, 0.58) * smoothstep(0.55, 0.85, cintila) * naAgua * 0.55 * uBrilho;

  // feixe de luz dourada (tom #c8b28a da marca)
  float feixe = smoothstep(0.32, 0.0, abs(tela.x * 0.8 + tela.y * 0.45 - fract(t * 0.035) * 2.4 + 0.5));
  cor += vec3(0.78, 0.70, 0.54) * feixe * 0.09 * uBrilho;

  // banho de verde da marca (#364339 / #70826a) nas sombras
  float lum = dot(cor, vec3(0.299, 0.587, 0.114));
  cor = mix(cor, mix(vec3(0.10, 0.135, 0.11), vec3(0.72, 0.80, 0.66), lum), 0.30 * uLiquido * (1.0 - smoothstep(0.35, 0.8, lum)));

  // tom quente/verde da identidade e vinheta
  cor = mix(cor, cor * vec3(1.04, 1.01, 0.94), 0.6);
  float vin = smoothstep(1.15, 0.35, length((tela - 0.5) * vec2(1.1, 1.0)));
  cor *= mix(0.78, 1.0, vin);

  // grão de filme
  cor += (hash(tela * uRes + fract(t)) - 0.5) * 0.025;

  gl_FragColor = vec4(cor, 1.0);
}`;

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** ponto focal (0–1) usado no recorte, como object-position */
  foco?: [number, number];
  /** altura (0 = topo, 1 = base) onde começa a água na foto; 2 desliga */
  linhaAgua?: number;
  /** força do parallax pela rolagem */
  parallax?: number;
  brilho?: number;
  /** intensidade do efeito líquido na cena toda (0 desliga) */
  liquido?: number;
  prioridade?: boolean;
};

export function ShaderFoto({ src, alt, className = "", foco = [0.5, 0.5], linhaAgua = 2, parallax = 0.5, brilho = 1, liquido = 0, prioridade = false }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const [pronto, setPronto] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;

  useEffect(() => {
    const el = caixa.current;
    const cv = tela.current;
    if (!el || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conexao?.saveData) return;

    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", premultipliedAlpha: false });
    if (!gl) return;

    const compilar = (tipo: number, codigo: string) => {
      const sh = gl.createShader(tipo)!;
      gl.shaderSource(sh, codigo);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };
    const vs = compilar(gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), img: u("uImg"), foco: u("uFoco"), mouse: u("uMouse"), mouseForca: u("uMouseForca"),
      tempo: u("uTempo"), agua: u("uAgua"), scroll: u("uScroll"), zoom: u("uZoom"), brilho: u("uBrilho"), liquido: u("uLiquido"), gotas: u("uGotas[0]"),
    };
    gl.uniform2f(U.foco, foco[0], foco[1]);
    gl.uniform1f(U.agua, linhaAgua);
    gl.uniform1f(U.brilho, brilho);
    gl.uniform1f(U.liquido, liquido);

    const tex = gl.createTexture();
    let imgW = 1;
    let imgH = 1;
    let carregou = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      gl.uniform2f(U.img, imgW, imgH);
      carregou = true;
    };
    img.src = url;

    // celulares: resolução menor para economizar bateria
    const movel = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const dprMax = movel ? 1.25 : 1.75;
    const redimensionar = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprMax);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.res, cv.width, cv.height);
      // redimensionar limpa o canvas: redesenha mesmo fora da tela
      if (carregou) gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    redimensionar();
    const ro = new ResizeObserver(redimensionar);
    ro.observe(el);

    const mouse = { x: 0.5, y: 0.75, alvoX: 0.5, alvoY: 0.75, forca: 0, alvoForca: 0 };
    // gotas: nascem no rastro do cursor, no toque e, de tempos em tempos, sozinhas na água
    const t0 = performance.now();
    const gotas = new Float32Array(40);
    let proxima = 0;
    let ultima = { x: -1, y: -1, t: 0 };
    let chuva = 0;
    const pingar = (x: number, y: number, forca: number) => {
      gotas.set([x, y, (performance.now() - t0) / 1000, forca], proxima * 4);
      proxima = (proxima + 1) % 10;
    };
    // ouvido na janela: o texto por cima da foto não bloqueia a onda
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      mouse.alvoX = x;
      mouse.alvoY = y;
      mouse.alvoForca = 1;
      if (liquido > 0) {
        const agora = performance.now();
        const anda = Math.hypot((x - ultima.x) * (r.width / r.height), y - ultima.y);
        if (e.type === "pointerdown") pingar(x, y, 1.5);
        else if (anda > 0.06 && agora - ultima.t > 110) {
          pingar(x, y, Math.min(1, 0.45 + anda * 2));
          ultima = { x, y, t: agora };
        }
      }
    };
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", mover, { passive: true });

    let visivel = true;
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !raf) raf = requestAnimationFrame(quadro);
    });
    io.observe(el);

    let raf = 0;
    let mostrou = false;
    const quadro = (agora: number) => {
      raf = 0;
      if (!visivel) return;
      if (carregou) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // -1 (entrando por baixo) ... 1 (saindo por cima)
        const prog = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
        mouse.x += (mouse.alvoX - mouse.x) * 0.08;
        mouse.y += (mouse.alvoY - mouse.y) * 0.08;
        mouse.forca += (mouse.alvoForca - mouse.forca) * 0.04;
        if (mouse.alvoForca > 0) mouse.alvoForca *= 0.985;
        if (liquido > 0) {
          if (agora > chuva) {
            pingar(0.3 + Math.random() * 0.65, 0.68 + Math.random() * 0.25, 0.8);
            chuva = agora + 1300 + Math.random() * 1200;
          }
          gl.uniform4fv(U.gotas, gotas);
        }
        gl.uniform1f(U.tempo, (agora - t0) / 1000);
        gl.uniform1f(U.scroll, prog * parallax * 0.5);
        gl.uniform1f(U.zoom, 1.08 + Math.max(0, prog) * 0.06 * parallax);
        gl.uniform2f(U.mouse, mouse.x, mouse.y);
        gl.uniform1f(U.mouseForca, mouse.forca);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!mostrou) {
          mostrou = true;
          setPronto(true);
        }
      }
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", mover);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div ref={caixa} className={`relative overflow-hidden bg-verde-escuro ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : "auto"}
        decoding="async"
        className="absolute inset-0 size-full scale-[1.08] object-cover"
        style={{ objectPosition: `${foco[0] * 100}% ${foco[1] * 100}%` }}
      />
      <canvas
        ref={tela}
        aria-hidden="true"
        className={`absolute inset-0 size-full transition-opacity duration-700 ${pronto ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
