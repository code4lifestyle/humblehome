import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const R = 1.7

function isLand(lat, lon) {
  if (lat > 15 && lat < 72 && lon > -170 && lon < -50) return Math.random() > 0.28
  if (lat > -56 && lat < 13 && lon > -82 && lon < -34) return Math.random() > 0.3
  if (lat > 36 && lat < 72 && lon > -10 && lon < 40) return Math.random() > 0.32
  if (lat > -35 && lat < 37 && lon > -18 && lon < 52) return Math.random() > 0.38
  if (lat > -10 && lat < 75 && lon > 40 && lon < 150) return Math.random() > 0.4
  if (lat > -44 && lat < -10 && lon > 112 && lon < 154) return Math.random() > 0.32
  if (lat > 20 && lat < 46 && lon > 128 && lon < 146) return Math.random() > 0.28
  return false
}

function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { glowColor: { value: new THREE.Color('#4AEEFF') } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            float intensity = pow(0.72 - dot(vNormal, vPositionNormal), 2.1);
            gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.95;
          }
        `,
      }),
    [],
  )

  return (
    <mesh scale={1.22}>
      <sphereGeometry args={[R, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

function CityLights() {
  const { positions, colors } = useMemo(() => {
    const pos = []
    const col = []
    const magenta = new THREE.Color('#FF4DF0')
    const violet = new THREE.Color('#A855FF')
    const pink = new THREE.Color('#FF7AD9')

    let placed = 0
    let attempts = 0
    while (placed < 5200 && attempts < 100000) {
      attempts += 1
      const lat = Math.random() * 180 - 90
      const lon = Math.random() * 360 - 180
      if (!isLand(lat, lon)) continue
      const v = latLonToVec3(lat, lon, R * (1.004 + Math.random() * 0.014))
      pos.push(v.x, v.y, v.z)
      const c = Math.random() > 0.5 ? magenta : Math.random() > 0.5 ? violet : pink
      col.push(c.r, c.g, c.b)
      placed += 1
    }

    return { positions: new Float32Array(pos), colors: new Float32Array(col) }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function SurfaceGrid() {
  const { positions, linePositions } = useMemo(() => {
    const nodes = []
    for (let i = 0; i < 180; i += 1) {
      nodes.push(latLonToVec3(Math.random() * 160 - 80, Math.random() * 360 - 180, R * 1.012))
    }
    const pos = new Float32Array(nodes.length * 3)
    nodes.forEach((v, i) => {
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z
    })
    const lines = []
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (nodes[i].distanceTo(nodes[j]) < 0.6) {
          lines.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z)
        }
      }
    }
    return { positions: pos, linePositions: new Float32Array(lines) }
  }, [])

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color="#C8F4FF"
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#7AD4FF" transparent opacity={0.14} />
      </lineSegments>
    </group>
  )
}

function DataRays() {
  const matRef = useRef(null)
  const { positions, colors } = useMemo(() => {
    const pos = []
    const col = []
    const magenta = new THREE.Color('#FF4DF0')
    const cyan = new THREE.Color('#4AEEFF')
    for (let i = 0; i < 36; i += 1) {
      const start = latLonToVec3(Math.random() * 120 - 60, Math.random() * 360 - 180, R * 1.02)
      const end = start.clone().normalize().multiplyScalar(R + 0.5 + Math.random() * 1.3)
      pos.push(start.x, start.y, start.z, end.x, end.y, end.z)
      const c = Math.random() > 0.45 ? magenta : cyan
      col.push(c.r, c.g, c.b, c.r, c.g, c.b)
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) }
  }, [])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.opacity = 0.18 + Math.abs(Math.sin(state.clock.elapsedTime * 1.3)) * 0.25
    }
  })

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

function OrbitRings() {
  const group = useRef(null)
  const rings = useMemo(
    () =>
      [2.15, 2.5, 2.85].map((radius, idx) => {
        const count = 100 + idx * 28
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i += 1) {
          const a = (i / count) * Math.PI * 2
          pos[i * 3] = Math.cos(a) * radius
          pos[i * 3 + 1] = Math.sin(a * 0.12) * 0.1
          pos[i * 3 + 2] = Math.sin(a) * radius
        }
        return { pos, tilt: [0.45 + idx * 0.3, 0.15 * idx, 0.55 - idx * 0.12] }
      }),
    [],
  )

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      child.rotation.y += delta * (0.1 + i * 0.04) * (i % 2 === 0 ? 1 : -1)
    })
  })

  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <points key={i} rotation={ring.tilt}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[ring.pos, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.032}
            color={i === 1 ? '#FF4DF0' : '#7AD4FF'}
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  )
}

function FloatingDust() {
  const points = useRef(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i += 1) {
      const r = 2.4 + Math.random() * 4.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.025
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#D4B0FF"
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

function GlobeCore() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          color="#060810"
          roughness={0.8}
          metalness={0.35}
          emissive="#0C0618"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh scale={1.003}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color="#2A3A55" wireframe transparent opacity={0.06} />
      </mesh>
    </group>
  )
}

function RotatingGlobe() {
  const group = useRef(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08
  })

  return (
    <group ref={group}>
      <GlobeCore />
      <Atmosphere />
      <CityLights />
      <SurfaceGrid />
      <DataRays />
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#05060d']} />
      <ambientLight intensity={0.22} />
      <pointLight position={[5, 3, 4]} intensity={18} color="#4AEEFF" distance={24} />
      <pointLight position={[-4, -2, 3]} intensity={12} color="#FF4DF0" distance={20} />
      <directionalLight position={[2, 4, 2]} intensity={0.5} color="#b8c0d0" />
      <Stars radius={50} depth={40} count={1800} factor={2.2} saturation={0} fade speed={0.45} />

      {/* Far right — leaves room for left copy */}
      <group position={[2.35, 0.05, 0]} scale={1.2}>
        <RotatingGlobe />
        <OrbitRings />
        <FloatingDust />
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.7} luminanceThreshold={0.28} luminanceSmoothing={0.5} mipmapBlur />
      </EffectComposer>
    </>
  )
}

export default function GlobeHero() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        className="!h-full !w-full"
        style={{ width: '100%', height: '100%', display: 'block' }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.12, 5.6], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
