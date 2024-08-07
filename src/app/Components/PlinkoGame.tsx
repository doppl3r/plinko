import {
  Bounds,
  Center,
  Environment,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
  Stats,
  useBounds,
  useTexture,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { use, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const pinsConfig = {
  startPins: 3,
  pinGap: 3.5,
  viewPortScaleFactor: 50,
};

export function Game({}: any) {
  const persRef = useRef(null);
  const { viewport } = useThree();

  const { lines, pinGap, pinRadius, cameraPosition } = useControls({
    lines: {
      value: 16,
      min: 8,
      max: 16,
    },
    pinGap: {
      value: 5,
      min: 1,
      max: 5,
    },
    pinRadius: {
      value: 0.5,
      min: 0.1,
      max: 2,
    },
    cameraPosition: {
      value: [5, 40, 0],
    },
    cameraFOV: {
      value: 30,
      min: 5,
      max: 100,
    },
  });

  const renderPins = useMemo(() => {
    const pins = [];
    for (let i = 0; i < lines; i++) {
      const linePins = pinsConfig.startPins + i;
      const lineWidth = linePins * pinGap;
      for (let j = 0; j < linePins; j++) {
        const pinX = i * pinGap - lineWidth / 2 + pinGap / 2;
        const pinY = 0;
        const pinZ = j * pinGap - lineWidth / 2 + pinGap / 2;

        pins.push(
          <RigidBody
            // scale={0.2}
            name={`pin-${i}`}
            key={`pin-${i}-${j}`}
            type="fixed"
            colliders="ball"
            position={[pinX, pinY, pinZ]}
          >
            <mesh>
              <cylinderGeometry args={[pinRadius, pinRadius, 1, 64, 1]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        );
      }
    }
    return pins;
  }, [lines, pinGap, pinRadius, viewport.width]);

  const { cameraFOV, zoom, cameraPosition2 } = useMemo(() => {
    const viewportWidth = window.innerWidth;
    // THe more lines, the more we need to zoom out
    const fovAdjustment = viewportWidth > 1300 ? 10 : 110; // Adjust this threshold and value as needed

    const cameraFOV = fovAdjustment + (lines - 8) * 2;

    const zoomAdjustment = viewportWidth > 1300 ? -2 : -2; // Adjust this threshold and value as needed
    const zoom = 2.5 - (lines - 8) * 0.1 - zoomAdjustment;

    const cameraPosition2 = new THREE.Vector3(2, 40, 0).add(
      new THREE.Vector3(2, 40, 0).multiplyScalar(1.5)
    );

    return { cameraFOV, zoom, cameraPosition2 };
  }, [viewport.width, lines]);

  return (
    <>
      <Stats showPanel={0} className="stats" />
      {/* <OrbitControls
        // makeDefault
        // minAzimuthAngle={0}
        // maxAzimuthAngle={Math.PI / 2}
        // minPolarAngle={-Math.PI / 4}
        // maxPolarAngle={-Math.PI / 3}
        enableRotate={false}
        enableZoom={false}
        enablePan={false}
        zoomSpeed={0.3}
      /> */}
      <PerspectiveCamera
        ref={persRef}
        makeDefault
        fov={cameraFOV}
        position={cameraPosition2}
        zoom={zoom}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 0]} intensity={0.4} />
      <Environment preset="city" />
      {/* pins */}
      <Bounds fit observe margin={2.5}>
        <Center>{renderPins}</Center>
      </Bounds>
      {/* dropball */}
    </>
  );
}
