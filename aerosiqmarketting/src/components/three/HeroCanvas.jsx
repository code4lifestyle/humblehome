import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function CoreOrb() {
  const mesh = useRef(null)

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.x = t * 0.18
    mesh.current.rotation.y = t * 0.28
  })

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} scale={1.55}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#C2B5A2"
          emissive="#2A241C"
          emissiveIntensity={0.35}
          roughness={0.32}
          metalness={0.65}
          distort={0.3}
          speed={1.8}
          wireframe={false}
        />
      </mesh>
      <mesh scale={1.72}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#C2B5A2" wireframe transparent opacity={0.12} />
      </mesh>
    </Float>
  )
}

function OrbitRing({ radius, speed, color, tilt }) {
  const ref = useRef(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.elapsedTime * speed
  })

  return (
    <mesh ref={ref} rotation={[tilt, 0.4, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 180]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} />
    </mesh>
  )
}

function ParticleField() {
  const points = useRef(null)
  const positions = useMemo(() => {
    const count = 420
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const r = 3.2 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.04
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#B8AFA3"
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  )
}

function MouseLight() {
  const light = useRef(null)

  useFrame((state) => {
    if (!light.current) return
    const { x, y } = state.pointer
    light.current.position.x = THREE.MathUtils.lerp(light.current.position.x, x * 4, 0.08)
    light.current.position.y = THREE.MathUtils.lerp(light.current.position.y, y * 2.5, 0.08)
  })

  return <pointLight ref={light} intensity={10} distance={12} color="#C2B5A2" />
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#0b0b0c']} />
      <fog attach="fog" args={['#0b0b0c', 5.5, 16]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 5, 2]} intensity={0.85} color="#e8e2d8" />
      <MouseLight />
      <Stars radius={40} depth={30} count={1200} factor={2.2} saturation={0} fade speed={0.4} />
      <CoreOrb />
      <OrbitRing radius={2.35} speed={0.2} color="#C2B5A2" tilt={0.7} />
      <OrbitRing radius={2.85} speed={-0.12} color="#A8B0BC" tilt={-0.45} />
      <OrbitRing radius={3.35} speed={0.07} color="#8F8578" tilt={1.1} />
      <ParticleField />
    </>
  )
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
      <div className="noise pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" />
    </div>
  )
}
