import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

function DriftMesh({ color = '#2EE6A6' }) {
  const group = useRef(null)
  const geometry = useMemo(() => {
    const count = 28
    const positions = []
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2
      const r = 1.4 + (i % 3) * 0.35
      positions.push([Math.cos(angle) * r, Math.sin(angle * 1.4) * 0.55, Math.sin(angle) * r * 0.4])
    }
    return positions
  }, [])

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.12
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15
  })

  return (
    <group ref={group}>
      {geometry.map((pos, i) => (
        <mesh key={i} position={pos}>
          <octahedronGeometry args={[0.08 + (i % 4) * 0.02, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.18}
            roughness={0.45}
            metalness={0.55}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}
      <mesh>
        <torusKnotGeometry args={[0.85, 0.18, 128, 16]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.1}
          emissive={color}
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  )
}

export default function AmbientCanvas({ color = '#2EE6A6', className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[2, 2, 3]} intensity={6} color={color} />
        <DriftMesh color={color} />
      </Canvas>
    </div>
  )
}
