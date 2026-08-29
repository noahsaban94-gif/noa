import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ----------------------------------------------------
// GLSL Shaders with 3D Perlin / Simplex Noise
// ----------------------------------------------------
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uSpeed;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // 3D Simplex / Perlin Noise helpers
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;
    
    // Calculate noise offset on vertex position based on uTime
    float displacement = snoise(position * uNoiseScale + vec3(uTime * uSpeed)) * uNoiseStrength;
    vDisplacement = displacement;
    
    // Displace vertex along normal
    vec3 newPosition = position + normal * displacement;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uOpacity;
  uniform float uEnergy;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.2);

    // Color gradient shifted by uMouse
    // Emerald / Cyan WhatsApp & AI tone palettes:
    vec3 colorA = vec3(0.0, 0.65 + 0.25 * uMouse.x, 0.52 + 0.3 * uMouse.y); // Emerald / Teal
    vec3 colorB = vec3(0.1 + 0.4 * uMouse.y, 0.4 + 0.5 * uMouse.x, 0.85); // Cyan / Blue
    vec3 rimColor = vec3(0.0, 0.95, 0.7); // Bright glow rim

    float mixFactor = smoothstep(-0.3, 0.4, vDisplacement);
    vec3 base = mix(colorA, colorB, mixFactor);
    
    // Add pulsing energy and fresnel highlight
    vec3 finalColor = base + rimColor * fresnel * (0.8 + 0.5 * uEnergy);

    gl_FragColor = vec4(finalColor, uOpacity * (0.6 + 0.4 * fresnel));
  }
`;

interface AnimatedSphereMeshProps {
  isAnswering: boolean;
}

function AnimatedSphereMesh({ isAnswering }: AnimatedSphereMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uSpeed: { value: 0.8 },
      uNoiseScale: { value: 1.4 },
      uNoiseStrength: { value: 0.25 },
      uMouse: { value: new THREE.Vector3(0.5, 0.5, 0.0) },
      uOpacity: { value: 0.0 },
      uEnergy: { value: 0.0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Advance time
    materialRef.current.uniforms.uTime.value += delta;

    // Smoothly track mouse pointer (-1 to 1 mapped to 0 to 1)
    const targetX = (state.pointer.x + 1) * 0.5;
    const targetY = (state.pointer.y + 1) * 0.5;
    const dist = Math.hypot(state.pointer.x, state.pointer.y);

    materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMouse.value.x,
      targetX,
      0.08
    );
    materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMouse.value.y,
      targetY,
      0.08
    );
    materialRef.current.uniforms.uMouse.value.z = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMouse.value.z,
      dist,
      0.08
    );

    // Dynamic response when Noa is answering/processing
    const targetOpacity = isAnswering ? 0.95 : 0.25;
    const targetNoiseStrength = isAnswering ? 0.45 : 0.18;
    const targetSpeed = isAnswering ? 1.5 : 0.5;
    const targetEnergy = isAnswering ? 1.0 : 0.1;

    materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uOpacity.value,
      targetOpacity,
      0.06
    );
    materialRef.current.uniforms.uNoiseStrength.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uNoiseStrength.value,
      targetNoiseStrength,
      0.06
    );
    materialRef.current.uniforms.uSpeed.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uSpeed.value,
      targetSpeed,
      0.06
    );
    materialRef.current.uniforms.uEnergy.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uEnergy.value,
      targetEnergy,
      0.06
    );

    // Rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isAnswering ? 0.35 : 0.1);
      meshRef.current.rotation.x += delta * (isAnswering ? 0.15 : 0.05);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.55, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export interface NoiseSphereProps {
  isAnswering?: boolean;
  className?: string;
}

export const NoiseSphere: React.FC<NoiseSphereProps> = ({ 
  isAnswering = false, 
  className = '' 
}) => {
  return (
    <div 
      className={`pointer-events-none select-none transition-opacity duration-700 ${
        isAnswering ? 'opacity-90 scale-105' : 'opacity-25 scale-100'
      } ${className}`}
      style={{ willChange: 'opacity, transform' }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <AnimatedSphereMesh isAnswering={isAnswering} />
      </Canvas>
    </div>
  );
};
