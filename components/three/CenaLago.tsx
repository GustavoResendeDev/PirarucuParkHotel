"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Cena 3D do hero: lago ao pôr do sol com um pirarucu que nada e salta.
 * Tudo é gerado por código (sem modelos externos) para carregar rápido.
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
    float h = onda(p.xy, normalize(vec2(1.0,0.3)), 0.35, 0.9, 0.18)
            + onda(p.xy, normalize(vec2(-0.4,1.0)), 0.6, 1.3, 0.09)
            + onda(p.xy, normalize(vec2(0.7,-0.8)), 1.4, 2.1, 0.035);
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
  uniform vec3 uSol;
  uniform vec3 uCeu;
  uniform vec3 uCamera;
  varying vec3 vPos;
  varying float vAltura;
  void main(){
    vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
    vec3 v = normalize(uCamera - vPos);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 base = mix(uFundo, uRaso, smoothstep(-0.2, 0.25, vAltura));
    vec3 cor = mix(base, uCeu, fresnel * 0.85);
    // reflexo do sol numa faixa
    vec3 dirSol = normalize(vec3(0.0, 0.18, -1.0));
    vec3 r = reflect(-v, n);
    float brilho = pow(max(dot(r, dirSol), 0.0), 120.0) * 2.2 + pow(max(dot(r, dirSol), 0.0), 14.0) * 0.25;
    cor += uSol * brilho;
    // névoa para o horizonte
    float dist = length(vPos.xz - uCamera.xz);
    cor = mix(cor, uCeu, smoothstep(14.0, 38.0, dist));
    gl_FragColor = vec4(cor, 1.0);
  }
`;

const CEU_FRAG = /* glsl */ `
  varying vec3 vDir;
  void main(){
    float y = normalize(vDir).y;
    vec3 alto = vec3(0.16, 0.21, 0.17);
    vec3 meio = vec3(0.78, 0.55, 0.34);
    vec3 horizonte = vec3(0.98, 0.80, 0.55);
    vec3 cor = mix(horizonte, meio, smoothstep(0.0, 0.18, y));
    cor = mix(cor, alto, smoothstep(0.15, 0.6, y));
    // disco do sol
    float sol = smoothstep(0.9975, 0.9992, dot(normalize(vDir), normalize(vec3(0.0, 0.07, -1.0))));
    float halo = pow(max(dot(normalize(vDir), normalize(vec3(0.0, 0.07, -1.0))), 0.0), 40.0);
    cor += vec3(1.0, 0.9, 0.7) * sol + vec3(1.0, 0.7, 0.4) * halo * 0.35;
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

function Agua() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uTempo: { value: 0 },
      uRaso: { value: new THREE.Color("#4d6a5a") },
      uFundo: { value: new THREE.Color("#132320") },
      uSol: { value: new THREE.Color("#ffd9a0") },
      uCeu: { value: new THREE.Color("#d9a874") },
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
      <planeGeometry args={[90, 70, 220, 170]} />
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

/** Silhuetas de mata no horizonte. */
function Mata() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-50, 0);
    let x = -50;
    let seed = 3;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    while (x < 50) {
      x += 0.35 + rnd() * 0.6;
      s.lineTo(x, 1.1 + rnd() * 0.9 + Math.sin(x * 0.12) * 0.7 + Math.sin(x * 0.5) * 0.25);
    }
    s.lineTo(50, 0);
    s.lineTo(-50, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={[0, -0.05, -36]}>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#2d3a2b" fog />
      </mesh>
      <mesh geometry={geo} position={[6, -0.4, 3]} scale={[1.1, 0.8, 1]}>
        <meshBasicMaterial color="#1d281c" />
      </mesh>
    </group>
  );
}

/** Corpo do pirarucu: perfil lateral extrudado, com ondulação no vertex shader. */
function Pirarucu() {
  const grupo = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const respingos = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const s = new THREE.Shape();
    // perfil: cabeça à esquerda (x=0), cauda à direita (x=4)
    s.moveTo(0, 0);
    s.bezierCurveTo(0.2, 0.32, 1.1, 0.46, 2.2, 0.36);
    s.bezierCurveTo(2.9, 0.3, 3.3, 0.2, 3.5, 0.12);
    s.lineTo(4.1, 0.42);
    s.bezierCurveTo(4.0, 0.15, 4.0, -0.15, 4.1, -0.38);
    s.lineTo(3.5, -0.1);
    s.bezierCurveTo(3.2, -0.2, 2.6, -0.3, 2.0, -0.3);
    s.bezierCurveTo(1.0, -0.3, 0.25, -0.22, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.08, bevelSegments: 6, curveSegments: 40 });
    g.translate(-2, 0, -0.11);
    g.computeVertexNormals();
    return g;
  }, []);

  const uniforms = useMemo(() => ({ uTempo: { value: 0 } }), []);

  const nRespingos = 60;
  const posRespingos = useMemo(() => new Float32Array(nRespingos * 3), []);
  const velRespingos = useMemo(() => new Float32Array(nRespingos * 3), []);
  const ultimoSalto = useRef(-1);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (mat.current) mat.current.uniforms.uTempo.value = t;
    const g = grupo.current;
    if (!g) return;
    // ciclo de 9s: nada sob a superfície e salta
    const ciclo = 7;
    const c = (t % ciclo) / ciclo;
    const salto = c > 0.62 && c < 0.82 ? (c - 0.62) / 0.2 : -1;
    const x = THREE.MathUtils.lerp(-5, 13, c);
    let y = -0.55 + Math.sin(t * 2) * 0.05;
    let inclinacao = 0;
    if (salto >= 0) {
      y = -0.3 + Math.sin(salto * Math.PI) * 2.3;
      inclinacao = Math.cos(salto * Math.PI) * 0.9;
    }
    g.position.set(x, y, -7 + Math.sin(c * Math.PI * 2) * 1.2);
    g.rotation.set(0, Math.PI, -inclinacao);

    // dispara respingos na saída e na volta
    const ciclos = Math.floor(t / ciclo);
    const marca = salto >= 0 ? (salto < 0.1 ? ciclos * 2 : salto > 0.9 ? ciclos * 2 + 1 : -1) : -1;
    if (marca >= 0 && marca !== ultimoSalto.current) {
      ultimoSalto.current = marca;
      for (let i = 0; i < nRespingos; i++) {
        posRespingos[i * 3] = x + (Math.random() - 0.5) * 0.6;
        posRespingos[i * 3 + 1] = 0;
        posRespingos[i * 3 + 2] = g.position.z + (Math.random() - 0.5) * 0.6;
        const a = Math.random() * Math.PI * 2;
        const v = 0.6 + Math.random() * 1.4;
        velRespingos[i * 3] = Math.cos(a) * v;
        velRespingos[i * 3 + 1] = 2 + Math.random() * 2.5;
        velRespingos[i * 3 + 2] = Math.sin(a) * v;
      }
    }
    for (let i = 0; i < nRespingos; i++) {
      velRespingos[i * 3 + 1] -= 9.8 * dt;
      posRespingos[i * 3] += velRespingos[i * 3] * dt;
      posRespingos[i * 3 + 1] = Math.max(-2, posRespingos[i * 3 + 1] + velRespingos[i * 3 + 1] * dt);
      posRespingos[i * 3 + 2] += velRespingos[i * 3 + 2] * dt;
    }
    if (respingos.current) respingos.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <group ref={grupo} scale={0.75}>
        <mesh geometry={geo}>
          <shaderMaterial
            ref={mat}
            uniforms={uniforms}
            vertexShader={/* glsl */ `
              uniform float uTempo;
              varying float vX;
              varying vec3 vN;
              void main(){
                vec3 p = position;
                float k = smoothstep(-1.6, 2.1, p.x);
                p.z += sin(uTempo * 6.0 - p.x * 1.6) * 0.22 * k;
                vX = position.x;
                vN = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              }`}
            fragmentShader={/* glsl */ `
              varying float vX;
              varying vec3 vN;
              void main(){
                vec3 corpo = vec3(0.22, 0.27, 0.21);
                vec3 escama = vec3(0.72, 0.24, 0.12);
                vec3 cor = mix(corpo, escama, smoothstep(0.2, 1.9, vX));
                float luz = 0.45 + 0.55 * max(dot(vN, normalize(vec3(0.2, 0.6, 0.8))), 0.0);
                float borda = pow(1.0 - abs(vN.z), 2.0) * 0.35;
                gl_FragColor = vec4(cor * luz + vec3(1.0, 0.8, 0.55) * borda, 1.0);
              }`}
          />
        </mesh>
      </group>
      <points ref={respingos}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posRespingos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fff1d6" size={0.07} transparent opacity={0.85} depthWrite={false} />
      </points>
    </>
  );
}

/** Partículas de luz flutuando (pólen ao pôr do sol). */
function Polen() {
  const ref = useRef<THREE.Points>(null);
  const n = 220;
  const pos = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 30;
      a[i * 3 + 1] = Math.random() * 6 + 0.3;
      a[i * 3 + 2] = -Math.random() * 22;
    }
    return a;
  }, []);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.05) * 0.1;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.15;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffe2a8" size={0.05} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Câmera segue o mouse e desce/avança com a rolagem. */
function Camera({ progresso }: { progresso: React.RefObject<number> }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const p = progresso.current ?? 0;
    const alvoX = pointer.x * 0.8;
    const alvoY = 1.6 + pointer.y * 0.25 - p * 1.0;
    camera.position.x += (alvoX - camera.position.x) * 0.04;
    camera.position.y += (alvoY - camera.position.y) * 0.04;
    camera.position.z += (6 - p * 3 - camera.position.z) * 0.06;
    camera.lookAt(0, 0.9 - p * 0.6, -14);
  });
  return null;
}

export default function CenaLago({ progresso, pausado }: { progresso: React.RefObject<number>; pausado?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 1.6, 6], fov: 50, near: 0.1, far: 200 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={pausado ? "demand" : "always"}
      aria-hidden="true"
    >
      <fog attach="fog" args={["#d9a874", 18, 55]} />
      <Ceu />
      <Mata />
      <Agua />
      <Pirarucu />
      <Polen />
      <Camera progresso={progresso} />
    </Canvas>
  );
}
