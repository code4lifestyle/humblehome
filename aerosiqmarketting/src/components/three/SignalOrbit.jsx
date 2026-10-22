import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function OrbitRing({ radius, count, color, speed, tilt }) {
  const group = useRef(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2
      arr[i * 3] = Math.cos(a) * radius
      arr[i * 3 + 1] = Math.sin(a) * 0.08
      arr[i * 3 + 2] = Math.sin(a) * radius
    }
    return arr
  }, [radius, count])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed
  })

  return (
    <group ref={group} rotation={tilt}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color={color}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

function CorePulse() {
  const mesh = useRef(null)
  useFrame((state) => {
    if (!mesh.current) return
    const s = 0.85 + Math.sin(state.clock.elapsedTime * 1.6) * 0.12
    mesh.current.scale.setScalar(s)
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.45, 1]} />
      <meshStandardMaterial
        color="#C2B5A2"
        emissive="#4AEEFF"
        emissiveIntensity={0.25}
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

function TravelingSignals() {
  const group = useRef(null)
  const signals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        radius: 1.1 + (i % 3) * 0.55,
        speed: 0.6 + (i % 4) * 0.25,
        phase: (i / 12) * Math.PI * 2,
        color: i % 2 === 0 ? '#4AEEFF' : '#FF4DF0',
        tilt: [0.3 + (i % 3) * 0.25, 0.2 * (i % 2), 0.4 - (i % 3) * 0.1],
      })),
    [],
  )

  useFrame((state) => {
    if (!group.current) return
    group.current.children.forEach((child, i) => {
      const s = signals[i]
      const t = state.clock.elapsedTime * s.speed + s.phase
      child.position.x = Math.cos(t) * s.radius
      child.position.z = Math.sin(t) * s.radius
      child.position.y = Math.sin(t * 1.4) * 0.25
    })
  })

  return (
    <group ref={group}>
      {signals.map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.45}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

function LinkWeb() {
  const { positions } = useMemo(() => {
    const nodes = []
    for (let i = 0; i < 36; i += 1) {
      const r = 0.9 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      nodes.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.55,
          r * Math.cos(phi),
        ),
      )
    }
    const lines = []
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (nodes[i].distanceTo(nodes[j]) < 1.05) {
          lines.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z)
        }
      }
    }
    return { positions: new Float32Array(lines) }
  }, [])

  const ref = useRef(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12
  })

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#C2B5A2" transparent opacity={0.1} />
    </lineSegments>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#0c0c0e']} />
      <ambientLight intensity={0.18} />
      <pointLight position={[3, 2, 3]} intensity={9} color="#4AEEFF" distance={14} />
      <pointLight position={[-2, -1, 2]} intensity={7} color="#FF4DF0" distance={12} />
      <CorePulse />
      <OrbitRing radius={1.15} count={48} color="#4AEEFF" speed={0.35} tilt={[0.6, 0.2, 0.1]} />
      <OrbitRing radius={1.7} count={64} color="#FF4DF0" speed={-0.22} tilt={[-0.4, 0.5, 0.2]} />
      <OrbitRing radius={2.25} count={72} color="#C2B5A2" speed={0.14} tilt={[0.9, -0.3, 0.4]} />
      <TravelingSignals />
      <LinkWeb />
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.32} luminanceSmoothing={0.5} mipmapBlur />
      </EffectComposer>
    </>
  )
}

export default function SignalOrbit() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
