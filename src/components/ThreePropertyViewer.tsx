import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Building, Floor, PropertyUnit } from '../types/property';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  Box,
  Compass,
  Sparkles,
  Info,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';

interface ThreePropertyViewerProps {
  building: Building;
  selectedFloorId: string | null;
  selectedUnitId: string | null;
  isExploded: boolean;
  isolateFloor: boolean;
  showBoundaries: boolean;
  onSelectFloor: (floorId: string | null) => void;
  onSelectUnit: (unitId: string | null, floorId?: string) => void;
  onToggleExplode: () => void;
  onToggleIsolate: () => void;
  onToggleBoundaries: () => void;
  onRunAiAnalysis?: () => void;
  hideTopBar?: boolean;
  autoRotate?: boolean;
  zoomSignal?: number; // increments on zoom in (+) or decrements on zoom out (-)
  resetSignal?: number; // increments to trigger reset camera
}

export const ThreePropertyViewer: React.FC<ThreePropertyViewerProps> = ({
  building,
  selectedFloorId,
  selectedUnitId,
  isExploded,
  isolateFloor,
  showBoundaries,
  onSelectFloor,
  onSelectUnit,
  onToggleExplode,
  onToggleIsolate,
  onToggleBoundaries,
  onRunAiAnalysis,
  hideTopBar = false,
  autoRotate = false,
  zoomSignal = 0,
  resetSignal = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalAutoRotate, setInternalAutoRotate] = useState(false);
  const [hoveredUnit, setHoveredUnit] = useState<PropertyUnit | null>(null);
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number } | null>(null);

  // References to keep animation and three.js objects alive
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const floorGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const unitMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const boundaryLinesRef = useRef<Map<string, THREE.LineSegments>>(new Map());

  // Animation values
  const explodeProgressRef = useRef(0);
  const targetExplodeRef = useRef(0);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 6, 0));
  const cameraPosTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(18, 14, 18));
  const isTransitioningCameraRef = useRef(false);

  // Keep target explode in sync with prop
  useEffect(() => {
    targetExplodeRef.current = isExploded ? 1 : 0;
  }, [isExploded]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8FAFC); // Light GovTech background
    scene.fog = new THREE.FogExp2(0xF8FAFC, 0.012);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(22, 17, 22);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't dip below ground
    controls.minDistance = 6;
    controls.maxDistance = 50;
    controls.target.set(0, 6, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbf0, 1.3);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.6);
    fillLight.position.set(-15, 12, -15);
    scene.add(fillLight);

    // Environment: Ground Parcel Plot & Cadastral boundary
    buildGroundAndEnvironment(scene);

    // Build the 3D Building Floors & Units
    buildBuildingHierarchy(scene, building);

    // Raycaster for unit picking & hovering
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(unitMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const unitData = hit.object.userData.unit as PropertyUnit;
        if (unitData) {
          setHoveredUnit(unitData);
          setHoveredPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          containerRef.current.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredUnit(null);
      containerRef.current.style.cursor = 'default';
    };

    const handleClick = (e: MouseEvent) => {
      // Ignore click if mouse moved during drag
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(unitMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const unitData = hit.object.userData.unit as PropertyUnit;
        if (unitData) {
          onSelectUnit(unitData.id, unitData.floorId);
          onSelectFloor(unitData.floorId);
          return;
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('click', handleClick);

    // Window / Container Resize Handler
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smoothly update explode factor
      const diff = targetExplodeRef.current - explodeProgressRef.current;
      if (Math.abs(diff) > 0.001) {
        explodeProgressRef.current += diff * 0.12;
      } else {
        explodeProgressRef.current = targetExplodeRef.current;
      }

      // Apply explode vertical translation to floor groups
      const explodeMultiplier = 2.4; // meter gap per floor level
      floorGroupsRef.current.forEach((group, floorId) => {
        const floorIndex = group.userData.floorIndex as number;
        const baseElevation = group.userData.baseElevation as number;
        const targetY = baseElevation + floorIndex * explodeProgressRef.current * explodeMultiplier;
        group.position.y = targetY;
      });

      // Smooth camera interpolation if transitioning
      if (isTransitioningCameraRef.current) {
        controls.target.lerp(cameraTargetRef.current, 0.08);
        camera.position.lerp(cameraPosTargetRef.current, 0.08);
        if (
          controls.target.distanceTo(cameraTargetRef.current) < 0.05 &&
          camera.position.distanceTo(cameraPosTargetRef.current) < 0.05
        ) {
          isTransitioningCameraRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
    };
  }, [building]);

  // Build ground, parcel outline, road, and context buildings
  const buildGroundAndEnvironment = (scene: THREE.Scene) => {
    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.9,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Cadastral Survey Parcel Plot
    const parcelGeo = new THREE.BoxGeometry(22, 0.1, 20);
    const parcelMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.8,
    });
    const parcelMesh = new THREE.Mesh(parcelGeo, parcelMat);
    parcelMesh.position.set(0, 0, 0);
    parcelMesh.receiveShadow = true;
    scene.add(parcelMesh);

    // Cadastral Boundary Line (Glowing Green/Indigo perimeter)
    const points = [
      new THREE.Vector3(-11, 0.08, -10),
      new THREE.Vector3(11, 0.08, -10),
      new THREE.Vector3(11, 0.08, 10),
      new THREE.Vector3(-11, 0.08, 10),
      new THREE.Vector3(-11, 0.08, -10),
    ];
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(points);
    const boundaryMat = new THREE.LineBasicMaterial({
      color: 0x4F46E5,
      linewidth: 3,
    });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    scene.add(boundaryLine);

    // Roadway in front of parcel
    const roadGeo = new THREE.PlaneGeometry(80, 6);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      roughness: 0.7,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -0.02, 14);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Road central divider line
    const roadLineGeo = new THREE.PlaneGeometry(80, 0.2);
    const roadLineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const roadLineMesh = new THREE.Mesh(roadLineGeo, roadLineMat);
    roadLineMesh.rotation.x = -Math.PI / 2;
    roadLineMesh.position.set(0, -0.01, 14);
    scene.add(roadLineMesh);

    // Nearby context buildings (lightweight grey volumes for GIS neighborhood feel)
    const contextBuildings = [
      { pos: [-19, 3, -1], size: [7, 6, 12] },
      { pos: [19, 4, 1], size: [7, 8, 14] },
      { pos: [0, 2.5, -17], size: [16, 5, 8] },
    ];
    contextBuildings.forEach(({ pos, size }) => {
      const bGeo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const bMat = new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.9,
        transparent: true,
        opacity: 0.65,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(pos[0], pos[1], pos[2]);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);

      // Edges for architectural style
      const edges = new THREE.EdgesGeometry(bGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x94A3B8, transparent: true, opacity: 0.4 })
      );
      bMesh.add(line);
    });

    // 3D North Arrow Indicator on ground
    const northGroup = new THREE.Group();
    northGroup.position.set(-8.5, 0.1, 7.5);
    const arrowConeGeo = new THREE.ConeGeometry(0.35, 1.0, 4);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xDC2626 });
    const cone = new THREE.Mesh(arrowConeGeo, arrowMat);
    cone.rotation.x = -Math.PI / 2;
    cone.position.z = -0.5;
    northGroup.add(cone);
    scene.add(northGroup);
  };

  // Build the complete building floor hierarchy with slabs, glass facades, and units
  const buildBuildingHierarchy = (scene: THREE.Scene, bld: Building) => {
    // Clear previous refs
    floorGroupsRef.current.clear();
    unitMeshesRef.current.clear();
    boundaryLinesRef.current.clear();

    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'MainBuilding';

    bld.floors.forEach((floor, fIdx) => {
      const floorGroup = new THREE.Group();
      floorGroup.name = `Floor_${floor.id}`;
      floorGroup.userData = {
        floorId: floor.id,
        floorIndex: fIdx,
        baseElevation: floor.elevationMeters,
      };

      // 1. Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(13.2, 0.35, 9.2);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.4,
        metalness: 0.1,
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, 0, 0);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      floorGroup.add(slabMesh);

      // Slab edge lines
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const slabLine = new THREE.LineSegments(
        slabEdges,
        new THREE.LineBasicMaterial({ color: 0x94A3B8, linewidth: 1.5 })
      );
      slabMesh.add(slabLine);

      // 2. Ceiling slab for top floor
      if (fIdx === bld.floors.length - 1) {
        const roofGeo = new THREE.BoxGeometry(13.2, 0.4, 9.2);
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0xCBD5E1,
          roughness: 0.5,
        });
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.position.set(0, 3.2, 0);
        roofMesh.castShadow = true;
        floorGroup.add(roofMesh);

        // Architectural rooftop canopy / elevator lift room
        const liftRoomGeo = new THREE.BoxGeometry(4.0, 1.8, 3.5);
        const liftRoomMesh = new THREE.Mesh(liftRoomGeo, slabMat);
        liftRoomMesh.position.set(0, 4.3, 0);
        liftRoomMesh.castShadow = true;
        floorGroup.add(liftRoomMesh);
      }

      // 3. Glass Facade Enclosure (Semi-transparent modern curtain wall)
      const glassGeo = new THREE.BoxGeometry(13.1, 2.7, 9.1);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.22,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.8,
        ior: 1.4,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, 1.5, 0);
      glassMesh.userData = { isGlass: true };
      floorGroup.add(glassMesh);

      // 4. Units inside this floor
      floor.units.forEach((unit) => {
        const uGroup = new THREE.Group();
        uGroup.name = `Unit_${unit.id}`;

        const isConflict = unit.status === 'Conflict';
        const unitGeo = new THREE.BoxGeometry(unit.size[0] * 0.95, unit.size[1], unit.size[2] * 0.95);

        // Default unit material
        const unitMat = new THREE.MeshStandardMaterial({
          color: isConflict ? 0xFEE2E2 : 0xF8FAFC,
          roughness: 0.4,
          metalness: 0.05,
          transparent: true,
          opacity: 0.88,
        });

        const unitMesh = new THREE.Mesh(unitGeo, unitMat);
        unitMesh.position.set(unit.positionOffset[0], 1.5, unit.positionOffset[2]);
        unitMesh.castShadow = true;
        unitMesh.receiveShadow = true;
        unitMesh.userData = {
          unit: unit,
          floorId: floor.id,
          unitId: unit.id,
          isConflict,
        };

        // Unit Boundary Edges (GIS Spatial Extents)
        const edges = new THREE.EdgesGeometry(unitGeo);
        const edgeColor = isConflict ? 0xDC2626 : 0x2563EB;
        const edgeMat = new THREE.LineBasicMaterial({
          color: edgeColor,
          linewidth: isConflict ? 2.5 : 1.5,
        });
        const edgeLines = new THREE.LineSegments(edges, edgeMat);
        edgeLines.visible = showBoundaries;
        unitMesh.add(edgeLines);

        boundaryLinesRef.current.set(`${floor.id}_${unit.id}`, edgeLines);
        unitMeshesRef.current.set(unit.id, unitMesh);
        uGroup.add(unitMesh);
        floorGroup.add(uGroup);
      });

      floorGroupsRef.current.set(floor.id, floorGroup);
      buildingGroup.add(floorGroup);
    });

    scene.add(buildingGroup);
  };

  // React to prop changes: selection, isolation, boundaries, camera focus
  useEffect(() => {
    // 1. Update unit highlighting and materials
    unitMeshesRef.current.forEach((mesh, unitId) => {
      const unit = mesh.userData.unit as PropertyUnit;
      const isSelected = unitId === selectedUnitId;
      const isConflict = unit.status === 'Conflict';
      const isFloorSelected = unit.floorId === selectedFloorId;

      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (isSelected) {
        mat.color.setHex(0x4F46E5); // Bright indigo focus
        mat.opacity = 0.95;
        mat.roughness = 0.2;
      } else if (isConflict) {
        mat.color.setHex(0xEF4444); // Red warning conflict
        mat.opacity = 0.9;
      } else if (selectedUnitId && !isSelected) {
        mat.color.setHex(0xF1F5F9);
        mat.opacity = isolateFloor ? 0.15 : 0.45;
      } else if (selectedFloorId && isFloorSelected) {
        mat.color.setHex(0xDBEAFE); // Blue soft focus
        mat.opacity = 0.9;
      } else if (selectedFloorId && !isFloorSelected) {
        mat.color.setHex(0xF8FAFC);
        mat.opacity = isolateFloor ? 0.1 : 0.35;
      } else {
        mat.color.setHex(0xFFFFFF);
        mat.opacity = 0.85;
      }
    });

    // 2. Update Floor Group opacity for isolation
    floorGroupsRef.current.forEach((group, floorId) => {
      const isThisFloor = floorId === selectedFloorId;
      group.children.forEach((child) => {
        if (child.userData.isGlass) {
          const gMat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
          if (isolateFloor && selectedFloorId && !isThisFloor) {
            gMat.opacity = 0.05;
          } else {
            gMat.opacity = 0.22;
          }
        }
      });
    });

    // 3. Update boundary lines visibility
    boundaryLinesRef.current.forEach((line) => {
      line.visible = showBoundaries;
    });

    // 4. Smooth Camera Focus
    if (controlsRef.current && cameraRef.current) {
      if (selectedUnitId) {
        const mesh = unitMeshesRef.current.get(selectedUnitId);
        if (mesh) {
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          cameraTargetRef.current.copy(worldPos);
          cameraPosTargetRef.current.set(worldPos.x + 8, worldPos.y + 4, worldPos.z + 8);
          isTransitioningCameraRef.current = true;
        }
      } else if (selectedFloorId) {
        const floorGroup = floorGroupsRef.current.get(selectedFloorId);
        if (floorGroup) {
          const floorY = floorGroup.position.y + 1.5;
          cameraTargetRef.current.set(0, floorY, 0);
          cameraPosTargetRef.current.set(13, floorY + 4, 13);
          isTransitioningCameraRef.current = true;
        }
      }
    }
  }, [selectedFloorId, selectedUnitId, isolateFloor, showBoundaries]);

  // Auto rotate handler
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate || internalAutoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [autoRotate, internalAutoRotate]);

  // Handle external zoom signal
  useEffect(() => {
    if (!zoomSignal || !cameraRef.current || !controlsRef.current) return;
    const factor = zoomSignal > 0 ? 0.8 : 1.25;
    const offset = new THREE.Vector3()
      .subVectors(cameraRef.current.position, controlsRef.current.target)
      .multiplyScalar(factor);
    cameraPosTargetRef.current.copy(controlsRef.current.target).add(offset);
    cameraTargetRef.current.copy(controlsRef.current.target);
    isTransitioningCameraRef.current = true;
  }, [zoomSignal]);

  // Handle external reset signal
  useEffect(() => {
    if (!resetSignal) return;
    cameraTargetRef.current.set(0, 6, 0);
    cameraPosTargetRef.current.set(22, 17, 22);
    isTransitioningCameraRef.current = true;
  }, [resetSignal]);

  // Camera presets
  const handleResetCamera = () => {
    cameraTargetRef.current.set(0, 6, 0);
    cameraPosTargetRef.current.set(22, 17, 22);
    isTransitioningCameraRef.current = true;
    onSelectFloor(null);
    onSelectUnit(null);
  };

  const handleSetView = (view: 'isometric' | 'top' | 'front') => {
    if (view === 'isometric') {
      cameraPosTargetRef.current.set(16, 14, 16);
      cameraTargetRef.current.set(0, 6, 0);
    } else if (view === 'top') {
      cameraPosTargetRef.current.set(0, 28, 0.1);
      cameraTargetRef.current.set(0, 0, 0);
    } else if (view === 'front') {
      cameraPosTargetRef.current.set(0, 8, 22);
      cameraTargetRef.current.set(0, 8, 0);
    }
    isTransitioningCameraRef.current = true;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-slate-50 select-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block outline-none" />

      {/* Top 3D Control Bar */}
      {!hideTopBar && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          {/* Left: View & Explode Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
            <button
              onClick={onToggleExplode}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isExploded
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Smoothly separate floors vertically"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Collapse Floors' : 'Explode Floors'}</span>
            </button>

            <button
              onClick={onToggleIsolate}
              disabled={!selectedFloorId}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                !selectedFloorId
                  ? 'text-slate-300 cursor-not-allowed'
                  : isolateFloor
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Fade non-selected floors to inspect interior units"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Isolate Floor</span>
            </button>

            <button
              onClick={onToggleBoundaries}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                showBoundaries
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle 3D spatial unit boundaries"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Boundaries</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            {/* Camera Angles */}
            <button
              onClick={() => handleSetView('isometric')}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Isometric
            </button>
            <button
              onClick={() => handleSetView('front')}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Front
            </button>
            <button
              onClick={() => handleSetView('top')}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Top Survey
            </button>
          </div>

          {/* Right: Camera Actions & Run AI */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {onRunAiAnalysis && (
              <button
                onClick={onRunAiAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Spatial Analysis</span>
              </button>
            )}

            <div className="flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm">
              <button
                onClick={() => setInternalAutoRotate(!internalAutoRotate)}
                className={`p-1.5 rounded-md transition-colors ${
                  autoRotate || internalAutoRotate ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle auto orbit"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetCamera}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Reset camera view"
              >
                <Compass className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exploded Floor Labels in 3D overlay */}
      {isExploded && (
        <div className="absolute left-6 top-24 flex flex-col gap-2.5 pointer-events-none z-10">
          {[...building.floors].reverse().map((fl) => {
            const isSelected = fl.id === selectedFloorId;
            return (
              <div
                key={fl.id}
                onClick={() => onSelectFloor(fl.id)}
                className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border shadow-sm transition-all pointer-events-auto cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 scale-105'
                    : 'bg-white/90 backdrop-blur-sm text-slate-800 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase">{fl.name}</span>
                  <span className="text-[11px] opacity-75">· {fl.units.length} Units</span>
                </div>
                {fl.conflictCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Conflict</span>
                  </span>
                )}
                {fl.conflictCount === 0 && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hover Tooltip - Light Theme */}
      {hoveredUnit && hoveredPos && (
        <div
          className="absolute z-20 pointer-events-none bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-2 rounded-lg shadow-lg text-xs flex flex-col gap-1 -translate-x-1/2 -translate-y-full border border-slate-200"
          style={{ left: hoveredPos.x, top: hoveredPos.y - 12 }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-indigo-700">Unit {hoveredUnit.unitNumber}</span>
            <span className="text-[11px] text-slate-600 font-mono font-semibold">{hoveredUnit.areaSqFt} sq.ft</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
            {hoveredUnit.ulpin}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pt-0.5 border-t border-slate-100">
            <span>Status:</span>
            <span
              className={`font-semibold ${
                hoveredUnit.status === 'Conflict'
                  ? 'text-red-600'
                  : hoveredUnit.status === 'Verified'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {hoveredUnit.status}
            </span>
          </div>
        </div>
      )}

      {/* Bottom GIS Legend & Spatial Scale */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-slate-500 pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="text-[10px] font-medium text-slate-600">Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-indigo-600" />
            <span className="text-[10px] font-medium text-slate-600">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-red-500" />
            <span className="text-[10px] font-medium text-slate-600">Conflict</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs pointer-events-auto text-[10px] text-slate-500">
          <span className="font-mono">1 grid = 1.0m</span>
          <span className="text-slate-300">·</span>
          <span>Left-click: Orbit · Right-click: Pan · Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};
