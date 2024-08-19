import {
  Bounds,
  Center,
  Environment,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
  PivotControls,
  Stats,
  Trail,
  useBounds,
  useTexture,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CoefficientCombineRule,
  CollisionEnterHandler,
  CollisionEnterPayload,
  RigidBody,
  useAfterPhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { buttonGroup, useControls } from "leva";
import {
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import { MeshBasicMaterial } from "three";

const pinsConfig = {
  startPins: 3,
  pinGap: 3.5,
  viewPortScaleFactor: 50,
};

export function Game({ ballCount }: any) {
  const persRef: any = useRef(null);
  const [balls, setBalls] = useState<any>([]);
  const { viewport } = useThree();
  const { lines, pinGap, pinRadius, cameraPosition, pinsRotation } =
    useControls("Plinko Game", {
      lines: {
        value: 16,
        min: 8,
        max: 16,
      },
      pinGap: {
        value: 5.5,
        min: 1,
        max: 7,
      },
      pinRadius: {
        value: 0.8,
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
      pinsRotation: {
        value: [0, 5, 0],
      },
      // Drop Ball button
    });

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
            name={`pin-${i}`}
            key={`pin-${i}-${j}`}
            type="fixed"
            colliders="ball"
            userData={{
              type: "pin",
              id: `pin-${i}-${j}`,
            }}
            position={[pinY, pinX, pinZ]}
            activeCollisionTypes={2}
          >
            <mesh rotation={[0, 0, 0]}>
              <sphereGeometry args={[pinRadius, 64, 64]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        );
      }
    }
    return pins;
  }, [lines, pinGap, pinRadius]);

  const onHit = ({ ballId, position }: any) => {
    setBalls((balls: any) => balls.filter((b: any) => b.id !== ballId));
  };

  const addSingleBall = () => {
    const ballId = Math.random();
    const ball = {
      id: ballId,
      position: {
        x: 0,
        y: 30,
        z: 4.5,
      },
    };
    setBalls((balls: any) => [...balls, ball]);
  };

  const addLoopBalls = () => {
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        addSingleBall();
      }, i * 500);
    }
  };

  useControls("Add Single Ball", {
    Call: buttonGroup({
      DropBall: () => {
        addSingleBall();
      },
    }),
  });

  useControls("Add 50 Balls", {
    Call: buttonGroup({
      "Add 50 Balls": () => {
        addLoopBalls();
      },
    }),
  });

  return (
    <>
      <Stats showPanel={0} className="stats" />
      <OrbitControls />
      <PerspectiveCamera
        makeDefault
        ref={persRef}
        fov={cameraFOV}
        position={[25, Math.PI, 0]}
        zoom={zoom}
      />

      <ambientLight intensity={2} />
      <Environment preset="city" />
      {/* pins */}
      <Bounds fit observe margin={2.5}>
        <Center rotation={[-Math.PI, 0, 0]}>{renderPins}</Center>
      </Bounds>

      {balls.map((ball: any) => {
        return (
          <Bounds margin={2.5}>
            <Ball
              key={ball.name}
              {...ball}
              ballId={ball.id}
              position={ball.position}
              onHit={onHit}
            />
          </Bounds>
        );
      })}
    </>
  );
}

const BallMaterial = new THREE.MeshBasicMaterial({
  color: "red",
  toneMapped: false,
});
BallMaterial.color.multiplyScalar(42);

const Ball = ({ ballId, position, onHit }: any) => {
  const rigidBody: any = useRef();

  useEffect(() => {
    // Ball drop sound
    // const audio = new Audio("/audio/ballDrop.mp3");
    // audio.play();
  }, []);

  return (
    <RigidBody
      name={`ball-${ballId}`}
      key={ballId}
      ref={rigidBody}
      type="dynamic"
      colliders="ball"
      userData={{
        type: "ball",
        id: ballId,
      }}
      position={[position.x, position.y, position.z]}
      activeCollisionTypes={2}
      restitution={0.5}
      onCollisionEnter={(e: CollisionEnterPayload) => {
        if (e.rigidBodyObject?.userData.type === "pin") {
          // Change PIN color on collision and change it back after a 200ms delay
          e.rigidBodyObject?.children[0].material.color.set("green");
        }
      }}
    >
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  );
};
