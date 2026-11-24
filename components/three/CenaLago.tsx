"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Cena 3D do hero: lago verde ao anoitecer e um pirarucu desenhado em linhas
 * douradas, como o traço do logo, nadando, mergulhando e saltando.
 * Tudo gerado por código, sem modelos externos.
 */

const AGUA_VERT = /* glsl */ `
  uniform float uTempo;
  varying vec3 vPos;
  varying float vAltura;
  float onda(vec2 p, vec2 dir, float freq, float vel, float amp){
    return sin(dot(p, dir) * freq + uTempo * vel) * amp;
  }
  void main(){
    vec3 p = position;
    float h = onda(p.xy, normalize(vec2(1.0,0.3)), 0.32, 0.7, 0.16)
            + onda(p.xy, normalize(vec2(-0.4,1.0)), 0.55, 1.1, 0.08)
            + onda(p.xy, normalize(vec2(0.7,-0.8)), 1.3, 1.8, 0.03);
    p.z += h;
    vAltura = h;
    vec4 mundo = modelMatrix * vec4(p, 1.0);
    vPos = mundo.xyz;
    gl_Position = projectionMatrix * viewMatrix * mundo;
  }
`;

const AGUA_FRAG = /* glsl */ `
  uniform vec3 uRaso;
  uniform vec3 uFundo;
  uniform vec3 uOuro;
  uniform vec3 uHorizonte;
  uniform vec3 uCamera;
  varying vec3 vPos;
  varying float vAltura;
  void main(){
    vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
    vec3 v = normalize(uCamera - vPos);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 cor = mix(uFundo, uRaso, smoothstep(-0.2, 0.22, vAltura));
    cor = mix(cor, uHorizonte, fresnel * 0.7);
    vec3 dirLua = normalize(vec3(0.0, 0.2, -1.0));
    vec3 r = reflect(-v, n);
    float s = max(dot(r, dirLua), 0.0);
    cor += uOuro * (pow(s, 160.0) * 1.6 + pow(s, 18.0) * 0.18);
    float dist = length(vPos.xz - uCamera.xz);
    cor = mix(cor, uHorizonte, smoothstep(16.0, 40.0, dist));
    gl_FragColor = vec4(cor, 1.0);
  }
`;

const CEU_VERT = /* glsl */ `
  varying vec3 vDir;
  void main(){
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const CEU_FRAG = /* glsl */ `
  varying vec3 vDir;
  void main(){
    vec3 d = normalize(vDir);
    float y = d.y;
    vec3 alto = vec3(0.106, 0.133, 0.114);      // verde noite
    vec3 meio = vec3(0.212, 0.263, 0.224);      // verde da marca
    vec3 horizonte = vec3(0.48, 0.46, 0.36);    // creme apagado
    vec3 cor = mix(horizonte, meio, smoothstep(0.0, 0.14, y));
    cor = mix(cor, alto, smoothstep(0.12, 0.55, y));
    vec3 dirLua = normalize(vec3(0.0, 0.12, -1.0));
    float c = dot(d, dirLua);
    cor += vec3(0.95, 0.88, 0.74) * smoothstep(0.99955, 0.99975, c);
    cor += vec3(0.78, 0.70, 0.54) * pow(max(c, 0.0), 60.0) * 0.4;
    gl_FragColor = vec4(cor, 1.0);
  }
`;

function Agua() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uTempo: { value: 0 },
      uRaso: { value: new THREE.Color("#3a4a3e") },
      uFundo: { value: new THREE.Color("#141b16") },
      uOuro: { value: new THREE.Color("#e9dfcb") },
      uHorizonte: { value: new THREE.Color("#4a5446") },
      uCamera: { value: new THREE.Vector3() },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTempo.value += dt;
    mat.current.uniforms.uCamera.value.copy(camera.position);
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -8]}>
      <planeGeometry args={[90, 70, 200, 160]} />
      <shaderMaterial ref={mat} vertexShader={AGUA_VERT} fragmentShader={AGUA_FRAG} uniforms={uniforms} />
    </mesh>
  );
}

function Ceu() {
  return (
    <mesh>
      <sphereGeometry args={[60, 32, 16]} />
      <shaderMaterial vertexShader={CEU_VERT} fragmentShader={CEU_FRAG} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/** Mata e palmeiras no horizonte. */
function Mata() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-50, 0);
    let x = -50;
    let seed = 7;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    while (x < 50) {
      x += 0.35 + rnd() * 0.6;
      s.lineTo(x, 1.0 + rnd() * 0.7 + Math.sin(x * 0.12) * 0.6 + Math.sin(x * 0.5) * 0.2);
    }
    s.lineTo(50, 0);
    s.lineTo(-50, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={[0, -0.05, -36]}>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#222b24" />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * Pirarucu em linhas: contorno + costelas verticais (como no logo).
 * Perfil: raio do corpo ao longo do comprimento (cabeça em u=0, cauda em u=1).
 * ------------------------------------------------------------------------- */
const COSTELAS = 30;
const SEG_ANEL = 28;
const LONGITUDINAIS = 6;
const COMPRIMENTO = 4.2;

function raio(u: number) {
  // cabeça afilada, corpo alongado, pedúnculo fino e cauda em leque
  const corpo = Math.sin(Math.min(u / 0.82, 1) * Math.PI) ** 0.75 * 0.42;
  const cauda = u > 0.82 ? Math.sin(((u - 0.82) / 0.18) * Math.PI) * 0.3 : 0;
  return Math.max(0.03, corpo + cauda);
}

function Pirarucu() {
  const grupo = useRef<THREE.Group>(null);
  const linhas = useRef<THREE.LineSegments>(null);
  const respingos = useRef<THREE.Points>(null);

  // pares de vértices (segmentos) para anéis + linhas longitudinais
  const { posicoes, base } = useMemo(() => {
    const segs: number[] = [];
    for (let i = 0; i <= COSTELAS; i++) {
      const u = i / COSTELAS;
      for (let k = 0; k < SEG_ANEL; k++) {
        const a0 = (k / SEG_ANEL) * Math.PI * 2;
        const a1 = ((k + 1) / SEG_ANEL) * Math.PI * 2;
        segs.push(u, a0, u, a1);
      }
    }
    const passos = 60;
    for (let l = 0; l < LONGITUDINAIS; l++) {
      const a = (l / LONGITUDINAIS) * Math.PI * 2;
      for (let s = 0; s < passos; s++) segs.push(s / passos, a, (s + 1) / passos, a);
    }
    const n = segs.length / 2;
    return { posicoes: new Float32Array(n * 3), base: new Float32Array(segs) };
  }, []);

  const nResp = 70;
  const posResp = useMemo(() => new Float32Array(nResp * 3).fill(-50), []);
  const velResp = useMemo(() => new Float32Array(nResp * 3), []);
  const ultimo = useRef(-1);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    // ondulação do corpo
    for (let i = 0; i < base.length / 2; i++) {
      const u = base[i * 2];
      const a = base[i * 2 + 1];
      const r = raio(u);
      const x = (u - 0.5) * COMPRIMENTO;
      const onda = Math.sin(t * 4.5 - u * 6) * 0.28 * u * u;
      posicoes[i * 3] = x;
      posicoes[i * 3 + 1] = Math.sin(a) * r * 0.85;
      posicoes[i * 3 + 2] = Math.cos(a) * r * 0.55 + onda;
    }
    if (linhas.current) linhas.current.geometry.attributes.position.needsUpdate = true;

    // trajetória: nada perto da superfície e salta a cada ciclo
    const g = grupo.current;
    if (!g) return;
    const ciclo = 8;
    const c = (t % ciclo) / ciclo;
    const x = THREE.MathUtils.lerp(-7, 11, c);
    const salto = c > 0.55 && c < 0.8 ? (c - 0.55) / 0.25 : -1;
    let y = 0.45 + Math.sin(t * 1.6) * 0.12;
    let incl = Math.cos(t * 1.6) * 0.08;
    if (salto >= 0) {
      y = 0.2 + Math.sin(salto * Math.PI) * 2.0;
      incl = Math.cos(salto * Math.PI) * 0.75;
    }
    g.position.set(x, y, -7.5 + Math.sin(c * Math.PI * 2) * 1.0);
    g.rotation.set(0, Math.PI, -incl);

    const marca = salto >= 0 && salto < 0.08 ? Math.floor(t / ciclo) : -1;
    if (marca >= 0 && marca !== ultimo.current) {
      ultimo.current = marca;
      for (let i = 0; i < nResp; i++) {
        posResp[i * 3] = x + (Math.random() - 0.5) * 0.8;
        posResp[i * 3 + 1] = 0.05;
        posResp[i * 3 + 2] = g.position.z + (Math.random() - 0.5) * 0.6;
        const ang = Math.random() * Math.PI * 2;
        const v = 0.5 + Math.random() * 1.2;
        velResp[i * 3] = Math.cos(ang) * v;
        velResp[i * 3 + 1] = 1.8 + Math.random() * 2.2;
        velResp[i * 3 + 2] = Math.sin(ang) * v;
      }
    }
    for (let i = 0; i < nResp; i++) {
      velResp[i * 3 + 1] -= 9.8 * dt;
      posResp[i * 3] += velResp[i * 3] * dt;
      posResp[i * 3 + 1] = Math.max(-3, posResp[i * 3 + 1] + velResp[i * 3 + 1] * dt);
      posResp[i * 3 + 2] += velResp[i * 3 + 2] * dt;
    }
    if (respingos.current) respingos.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <group ref={grupo} scale={0.8}>
        <lineSegments ref={linhas} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#e2d4b4" transparent opacity={0.9} />
        </lineSegments>
      </group>
      <points ref={respingos} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posResp, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e9dfcb" size={0.06} transparent opacity={0.8} depthWrite={false} />
      </points>
    </>
  );
}

/** Pontos de luz dourados (vaga-lumes). */
function VagaLumes() {
  const ref = useRef<THREE.Points>(null);
  const n = 160;
  const pos = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 30;
      a[i * 3 + 1] = Math.random() * 5 + 0.3;
      a[i * 3 + 2] = -Math.random() * 22;
    }
    return a;
  }, []);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.05) * 0.08;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.12;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e9dfcb" size={0.045} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Camera({ progresso }: { progresso: React.RefObject<number> }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const p = progresso.current ?? 0;
    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.04;
    camera.position.y += (1.7 + pointer.y * 0.2 - p * 1.0 - camera.position.y) * 0.04;
    camera.position.z += (6 - p * 3 - camera.position.z) * 0.06;
    camera.lookAt(0, 1.0 - p * 0.6, -14);
  });
  return null;
}

export default function CenaLago({ progresso, pausado }: { progresso: React.RefObject<number>; pausado?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 1.7, 6], fov: 50, near: 0.1, far: 200 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={pausado ? "demand" : "always"}
      aria-hidden="true"
    >
      <Ceu />
      <Mata />
      <Agua />
      <Pirarucu />
      <VagaLumes />
      <Camera progresso={progresso} />
    </Canvas>
  );
}
