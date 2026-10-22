import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const SEGMENTS = 48
const RADIUS = 0.72
const HEIGHT = 5.2
const TURNS = 2.4

function helixPoint(i, total, phase = 0) {
  const t = i / (total - 1)
  const angle = t * Math.PI * 2 * TURNS + phase
  const y = (t - 0.5) * HEIGHT
  return new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS)
}

function DNAStrands() {
  const group = useRef(null)

  const { strandA, strandB, rungs, rungColors } = useMemo(() => {
    const a = []
    const b = []
    const rungPos = []
    const colors = []
    const cA = new THREE.Color('#4AEEFF')
    const cB = new THREE.Color('#FF4DF0')
    const cMix = new THREE.Color('#C2B5A2')

    for (let i = 0; i < SEGMENTS; i += 1) {
      const pA = helixPoint(i, SEGMENTS, 0)
      const pB = helixPoint(i, SEGMENTS, Math.PI)
      a.push(pA.x, pA.y, pA.z)
      b.push(pB.x, pB.y, pB.z)

      if (i % 2 === 0) {
        rungPos.push(pA.x, pA.y, pA.z, pB.x, pB.y, pB.z)
        const c = i % 4 === 0 ? cA : i % 4 === 2 ? cB : cMix
        colors.push(c.r, c.g, c.b, c.r, c.g, c.b)
      }
    }

    return {
      strandA: new Float32Array(a),
      strandB: new Float32Array(b),
      rungs: new Float32Array(rungPos),
      rungColors: new Float32Array(colors),
    }
  }, [])

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.28
      group.current.rotation.x = Math.sin(performance.now() * 0.00035) * 0.12
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0.15, 0.4, 0.2]} scale={1.15}>
      {/* Strand A nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[strandA, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          color="#4AEEFF"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Strand B nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[strandB, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          color="#FF4DF0"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Base-pair rungs */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[rungs, 3]} />
          <bufferAttribute attach="attributes-color" args={[rungColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Soft backbone tubes via small spheres along strands */}
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const pA = helixPoint(i, SEGMENTS, 0)
        const pB = helixPoint(i, SEGMENTS, Math.PI)
        return (
          <group key={i}>
            <mesh position={pA}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial
                color="#2A8A9A"
                emissive="#4AEEFF"
                emissiveIntensity={0.35}
                roughness={0.45}
                metalness={0.35}
              />
            </mesh>
            <mesh position={pB}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial
                color="#8A2A7A"
                emissive="#FF4DF0"
                emissiveIntensity={0.35}
                roughness={0.45}
                metalness={0.35}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function OrbitDust() {
  const points = useRef(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(220 * 3)
    for (let i = 0; i < 220; i += 1) {
      const r = 1.4 + Math.random() * 3.2
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 6
      arr[i * 3] = Math.cos(theta) * r
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = Math.sin(theta) * r
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.08
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#C2B5A2"
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#08080a']} />
      <ambientLight intensity={0.18} />
      <pointLight position={[3, 2, 4]} intensity={10} color="#4AEEFF" distance={16} />
      <pointLight position={[-3, -1, 2]} intensity={8} color="#FF4DF0" distance={14} />
      <DNAStrands />
      <OrbitDust />
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.65} luminanceThreshold={0.3} luminanceSmoothing={0.5} mipmapBlur />
      </EffectComposer>
    </>
  )
}

export default function DNABackground() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 6.2], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
