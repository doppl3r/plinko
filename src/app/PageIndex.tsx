"use client";

import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import {
  CameraControls,
  Environment,
  Loader,
  OrbitControls,
  useEnvironment,
  useProgress,
} from "@react-three/drei";
import { Game } from "./Components/PlinkoGame";
import { Leva, useControls } from "leva";

import Image from "next/image";
import { Physics } from "@react-three/rapier";

export default function PageIndex() {
  const { canvasCameraPosition } = useControls({
    canvasCameraPosition: {
      value: [0, 0, 0],
    },
  });

  return (
    <div
      className={`h-full min-h-screen w-full grid grid-cols-[repeat(7,1fr)] grid-rows-[auto] bg-slate-900`}
    >
      <div className="col-start-1 col-end-8">
        <Canvas
          className={`col-start-1 col-span-8 row-start-1 `}
          shadows
          camera={{ position: canvasCameraPosition }}
        >
          <Physics debug>
            <Suspense>
              <Game />
            </Suspense>
          </Physics>
        </Canvas>
      </div>
    </div>
  );
}
