"use client";

import React, { useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import {
  CameraControls,
  Center,
  Environment,
  Loader,
  OrbitControls,
  useEnvironment,
  useProgress,
} from "@react-three/drei";
import { Game } from "./Components/PlinkoGame";

import { Physics, RigidBody } from "@react-three/rapier";

export default function PageIndex() {
  return (
    <div
      className={`h-full min-h-screen w-full grid grid-cols-[repeat(7,1fr)] grid-rows-[auto] bg-black`}
    >
      <Canvas className={`col-start-1 col-span-8 row-start-1 `} shadows>
        <Physics debug>
          <Suspense>
            <Game />
          </Suspense>
        </Physics>
      </Canvas>
    </div>
  );
}
