import { useRef, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// FIFA pitch dimensions: 105m x 68m, scaled to scene units
const PW = 10.5;
const PH = 6.8;

function PitchSurface() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[PW + 1, PH + 1]} />
      <meshStandardMaterial color="#1a5e1a" roughness={0.9} />
    </mesh>
  );
}

function PitchLines() {
  const lines = useMemo(() => {
    const pts = [];
    const hw = PW / 2, hh = PH / 2;
    // Outer boundary
    pts.push([[-hw, 0, -hh], [hw, 0, -hh], [hw, 0, hh], [-hw, 0, hh], [-hw, 0, -hh]]);
    // Centre line
    pts.push([[0, 0, -hh], [0, 0, hh]]);
    // Penalty areas (16.5m = 1.65 units, 40.32m wide = 4.032 units)
    const pa = 1.65, pw2 = 2.016;
    pts.push([[-hw, 0, -pw2], [-hw + pa, 0, -pw2], [-hw + pa, 0, pw2], [-hw, 0, pw2]]);
    pts.push([[hw, 0, -pw2], [hw - pa, 0, -pw2], [hw - pa, 0, pw2], [hw, 0, pw2]]);
    // Goal areas (5.5m = 0.55 units, 18.32m = 1.832 units)
    const ga = 0.55, gw2 = 0.916;
    pts.push([[-hw, 0, -gw2], [-hw + ga, 0, -gw2], [-hw + ga, 0, gw2], [-hw, 0, gw2]]);
    pts.push([[hw, 0, -gw2], [hw - ga, 0, -gw2], [hw - ga, 0, gw2], [hw, 0, gw2]]);
    return pts;
  }, []);

  // Centre circle
  const circlePoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.915, 0.001, Math.sin(a) * 0.915));
    }
    return pts;
  }, []);

  return (
    <group position={[0, 0.005, 0]}>
      {lines.map((lineArr, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={lineArr.length}
              array={new Float32Array(lineArr.flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" linewidth={1} />
        </line>
      ))}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={circlePoints.length}
            array={new Float32Array(circlePoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" />
      </line>
    </group>
  );
}

function Goalpost({ side }) {
  const x = side === 'left' ? -PW / 2 : PW / 2;
  const postH = 0.244, barW = 0.732;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, postH / 2, -barW / 2]}>
        <cylinderGeometry args={[0.012, 0.012, postH, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, postH / 2, barW / 2]}>
        <cylinderGeometry args={[0.012, 0.012, postH, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, postH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, barW, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}

function PlayerMarker({ player, position, onClick, isSelected, suitColor }) {
  const x = ((position.x - 50) / 50) * (PW / 2);
  const z = ((position.y - 50) / 50) * (PH / 2);
  const color = suitColor === 'red' ? '#EF4444' : suitColor === 'yellow' ? '#F59E0B' : '#00FF87';
  const isHome = player.team !== 'opponent';

  return (
    <group position={[x, 0, z]} onClick={(e) => { e.stopPropagation(); onClick?.(player); }}>
      {/* Body cylinder */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />
        <meshStandardMaterial color={isHome ? color : '#EF4444'} emissive={isSelected ? color : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} />
      </mesh>
      {/* Head sphere */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.14, 0.18, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
      {/* Position label */}
      <Text position={[0, 0.5, 0]} fontSize={0.08} color="white" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#000">
        {player.position_label || player.primary_position || ''}
      </Text>
      {/* Name */}
      <Text position={[0, -0.08, 0]} fontSize={0.06} color="#CBD5E1" anchorX="center" anchorY="top" outlineWidth={0.003} outlineColor="#000" maxWidth={0.6}>
        {player.short_name?.split(' ').pop() || ''}
      </Text>
    </group>
  );
}

function Scene({ players, onPlayerClick, selectedId }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <PitchSurface />
      <PitchLines />
      <Goalpost side="left" />
      <Goalpost side="right" />
      {players.map((p, i) => (
        <PlayerMarker
          key={p.id || i}
          player={p}
          position={{ x: p.x ?? 50, y: p.y ?? 50 }}
          onClick={onPlayerClick}
          isSelected={selectedId === p.id}
          suitColor={p.color || 'green'}
        />
      ))}
      <OrbitControls
        maxPolarAngle={Math.PI / 2.2}
        minDistance={2}
        maxDistance={15}
        target={[0, 0, 0]}
        enablePan
      />
    </>
  );
}

export default function FootballPitch3D({ players = [], onPlayerClick, selectedPlayerId, className = '' }) {
  return (
    <div className={`w-full rounded-lg overflow-hidden border border-slate-800 ${className}`} style={{ height: 500 }}>
      <Canvas
        camera={{ position: [0, 7, 7], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <Scene
          players={players}
          onPlayerClick={onPlayerClick}
          selectedId={selectedPlayerId}
        />
      </Canvas>
    </div>
  );
}
