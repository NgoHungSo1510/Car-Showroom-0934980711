import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Model3DConfig {
  hasModel: boolean;
  fileUrl?: string;
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  ambientLight: number;
  directionalLight: number;
  colorConfigs: {
    name: string;
    hexCode: string;
    meshNames: string[];
    isDefault?: boolean;
  }[];
}

interface ThreeDViewerProps {
  config: Model3DConfig;
  fallbackImage?: string;
  carName: string;
}

// 3D Model Component
const CarModel: React.FC<{ url: string; color?: string; meshNames?: string[] }> = ({
  url,
  color,
  meshNames = [],
}) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Apply color to specified meshes
  useEffect(() => {
    if (color && meshNames.length > 0) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (meshNames.includes(child.name) || meshNames.length === 0) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material = child.material.clone();
              child.material.color.set(color);
            }
          }
        }
      });
    }
  }, [scene, color, meshNames]);

  // Auto rotate
  useFrame((_state, _delta) => {
    if (modelRef.current) {
      // Slow auto rotation when not interacting
      // modelRef.current.rotation.y += delta * 0.1;
    }
  });

  return <primitive ref={modelRef} object={scene} />;
};

// Camera Controller
const CameraController: React.FC<{
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}> = ({ position, target }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(target.x, target.y, target.z);
  }, [camera, position, target]);

  return null;
};

// Loading Spinner
const LoadingSpinner: React.FC = () => (
  <Html center>
    <div className="flex flex-col items-center gap-4">
      <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-text-primary text-sm">Đang tải mô hình 3D...</p>
    </div>
  </Html>
);

// Main Component
const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ config, fallbackImage, carName }) => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    config.colorConfigs.find((c) => c.isDefault)?.hexCode || config.colorConfigs[0]?.hexCode,
  );
  const [selectedMeshNames, setSelectedMeshNames] = useState<string[]>(
    config.colorConfigs.find((c) => c.isDefault)?.meshNames ||
      config.colorConfigs[0]?.meshNames ||
      [],
  );

  const handleColorChange = (hexCode: string, meshNames: string[]) => {
    setSelectedColor(hexCode);
    setSelectedMeshNames(meshNames);
  };

  // Fallback to image if no 3D model
  if (!config.hasModel || !config.fileUrl) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-surface rounded-2xl overflow-hidden">
        {fallbackImage ? (
          <img src={fallbackImage} alt={carName} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <div className="text-center">
              <svg
                className="size-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>Hình ảnh sẽ được cập nhật</p>
            </div>
          </div>
        )}

        {/* Gallery fallback badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-text-primary">
          Mô hình 3D sẽ được cập nhật
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-surface to-background rounded-2xl overflow-hidden">
      {/* Canvas */}
      <Canvas
        camera={{ fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="cursor-grab active:cursor-grabbing"
      >
        <CameraController position={config.cameraPosition} target={config.cameraTarget} />

        {/* Lighting */}
        <ambientLight intensity={config.ambientLight} />
        <directionalLight position={[10, 10, 5]} intensity={config.directionalLight} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="city" />

        {/* Model */}
        <Suspense fallback={<LoadingSpinner />}>
          <CarModel url={config.fileUrl} color={selectedColor} meshNames={selectedMeshNames} />
        </Suspense>

        {/* Shadow */}
        <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Controls UI */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        {/* Color Picker */}
        {config.colorConfigs.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-xl">
            <span className="text-xs text-white/70 mr-1">Màu sắc:</span>
            {config.colorConfigs.map((colorConfig) => (
              <button
                key={colorConfig.hexCode}
                onClick={() => handleColorChange(colorConfig.hexCode, colorConfig.meshNames)}
                className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === colorConfig.hexCode
                    ? 'border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: colorConfig.hexCode }}
                title={colorConfig.name}
              />
            ))}
          </div>
        )}

        {/* Interaction hint */}
        <div className="px-3 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-xs text-white/70">
          <span className="hidden md:inline">Kéo để xoay • Cuộn để zoom</span>
          <span className="md:hidden">Vuốt để xoay • Chụm để zoom</span>
        </div>
      </div>

      {/* 3D Badge */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary/90 rounded-lg text-xs font-bold text-text-primary">
        3D INTERACTIVE
      </div>
    </div>
  );
};

export default ThreeDViewer;
