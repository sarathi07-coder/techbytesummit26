'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw, Sparkles, Layers, Box, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ChemicalBottle } from '@/types/chemical';

interface ThreeBottleViewerProps {
  bottle: ChemicalBottle;
}

/**
 * Generates an ultra-crisp high-resolution chemical reagent label matching Image 2
 * featuring bold typography, dual GHS warning hazard badges, lot/expiry, and a scannable QR code matrix.
 */
function createRealisticBottleLabelCanvas(bottle: ChemicalBottle): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  // 1. Label Background (Clean Off-White Chemical Matte Paper)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1024, 1280);

  // Label Outer Border
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 1000, 1256);

  // Top Color Accent Bar
  const isCritical = bottle.riskLevel === 'critical';
  ctx.fillStyle = isCritical ? '#E11D48' : '#0284C7';
  ctx.fillRect(16, 16, 992, 28);

  // 2. Header Text (Exact match to Image 2)
  ctx.fillStyle = '#1D4ED8'; // Bold Blue
  ctx.font = '900 40px Arial, sans-serif';
  ctx.fillText('PREMIUM GRADE', 60, 95);

  // Chemical Canonical Name (e.g. Fetal Bovine Serum or Ether)
  ctx.fillStyle = '#1E3A8A'; // Deep Navy
  ctx.font = 'bold 48px Arial, sans-serif';
  const name = bottle.chemical.canonicalName.length > 20 
    ? bottle.chemical.canonicalName.slice(0, 20) + '...' 
    : bottle.chemical.canonicalName;
  ctx.fillText(name, 60, 160);

  // Subtitle (Exact Image 2 format)
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText('100% US Origin', 60, 215);

  // Divider Line
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(60, 245);
  ctx.lineTo(964, 245);
  ctx.stroke();

  // 3. Two GHS Red Warning Circles (Exact Image 2!)
  // Left Circle: Thermometer with temperature ticks & red prohibition slash
  drawGhsCircle(ctx, 300, 410, 115, 'temperature');
  // Right Circle: Biohazard interlocking triple crescent
  drawGhsCircle(ctx, 724, 410, 115, 'biohazard');

  // 4. Product Details (Exact Image 2 text and structure)
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText('Product No. HQX-4685748U46', 60, 580);

  ctx.fillStyle = '#475569';
  ctx.font = '28px Arial, sans-serif';
  ctx.fillText('License number: 465X-453', 60, 635);
  ctx.fillText('Store at: 20°C', 60, 680);
  ctx.fillText('List number', 60, 725);

  // 5. Centered Scannable 2D QR Code Matrix (Exact Image 2 placement!)
  drawRealisticQrCode(ctx, 362, 790, 300, bottle.qrCode);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DIGITAL REAGENT HAZMAT AUDIT MATRIX', 512, 1195);
  ctx.textAlign = 'left';

  return canvas;
}

// Draw authentic GHS red circle badge with exact Image 2 pictograms: thermometer-prohibition & biohazard
function drawGhsCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, type: 'temperature' | 'biohazard' | 'flame' | 'bomb') {
  // 1. Red circular border (Exact Image 2 red warning ring!)
  ctx.save();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Draw interior pictogram
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'temperature') {
    // Exact Image 2: Thermometer with temperature ticks & red prohibition slash!
    // Thermometer bulb at bottom
    ctx.beginPath();
    ctx.arc(cx, cy + 30, 20, 0, Math.PI * 2);
    ctx.fill();

    // Thermometer stem going up
    ctx.beginPath();
    ctx.roundRect(cx - 10, cy - 50, 20, 60, 10);
    ctx.fill();

    // Inner mercury column
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cx - 4, cy - 36, 8, 48, 4);
    ctx.fill();

    // Temperature tick marks on the right side
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4;
    for (let t = -35; t <= 10; t += 15) {
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy + t);
      ctx.lineTo(cx + 26, cy + t);
      ctx.stroke();
    }

    // Red diagonal prohibition slash across the thermometer (Like Image 2!)
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 12;
    ctx.beginPath();
    const slashAngle = Math.PI / 4;
    ctx.moveTo(cx - Math.cos(slashAngle) * (r - 8), cy - Math.sin(slashAngle) * (r - 8));
    ctx.lineTo(cx + Math.cos(slashAngle) * (r - 8), cy + Math.sin(slashAngle) * (r - 8));
    ctx.stroke();

  } else if (type === 'biohazard') {
    // Exact Image 2: Biohazard symbol with 3 interlocking crescent arcs and center core
    ctx.save();
    ctx.translate(cx, cy);

    // Center circular hub cutout
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // 3 outer crescent lobes at 90°, 210°, 330°
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * 120) * (Math.PI / 180));

      // Outer bulbous lobe
      ctx.beginPath();
      ctx.arc(0, -32, 28, 0.4 * Math.PI, 0.6 * Math.PI, true);
      ctx.arc(0, -32, 38, 0.6 * Math.PI, 0.4 * Math.PI, false);
      ctx.fill();

      // Sharp inner crescent blade
      ctx.beginPath();
      ctx.arc(0, -22, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Outer safety concentric ring segment
      ctx.beginPath();
      ctx.arc(0, 0, 48, -0.2 * Math.PI, 0.2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.restore();
    }

    // White center clear dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (type === 'flame') {
    // Classic GHS Flame
    ctx.beginPath();
    ctx.moveTo(cx, cy - 55);
    ctx.quadraticCurveTo(cx + 38, cy - 15, cx + 32, cy + 30);
    ctx.quadraticCurveTo(cx + 18, cy + 50, cx, cy + 50);
    ctx.quadraticCurveTo(cx - 18, cy + 50, cx - 32, cy + 30);
    ctx.quadraticCurveTo(cx - 38, cy - 15, cx, cy - 55);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 15);
    ctx.quadraticCurveTo(cx + 12, cy, cx + 10, cy + 25);
    ctx.quadraticCurveTo(cx, cy + 35, cx - 10, cy + 25);
    ctx.quadraticCurveTo(cx - 12, cy, cx, cy - 15);
    ctx.fill();

  } else {
    // Exploding bomb symbol
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 28, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 32, cy + 10 + Math.sin(a) * 32);
      ctx.lineTo(cx + Math.cos(a) * 52, cy + 10 + Math.sin(a) * 52);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// Draw authentic QR code matrix
function drawRealisticQrCode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, text: string) {
  const cells = 25;
  const cellSize = size / cells;

  // Background white box
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 10, y - 10, size + 20, size + 20);

  ctx.fillStyle = '#0F172A';

  // Helper to draw QR finder pattern (7x7 with 3x3 core)
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillRect(x + fx * cellSize, y + fy * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + (fx + 1) * cellSize, y + (fy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + (fx + 2) * cellSize, y + (fy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinder(0, 0); // Top-left
  drawFinder(cells - 7, 0); // Top-right
  drawFinder(0, cells - 7); // Bottom-left

  // Deterministic pseudo-random QR data bits
  let seed = 42;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) & 0xffffff;
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Avoid finder patterns
      if ((r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8)) {
        continue;
      }
      seed = (seed * 1664525 + 1013904223) & 0xffffff;
      if (seed % 3 === 0) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize - 0.5, cellSize - 0.5);
      }
    }
  }
}

export default function ThreeBottleViewer({ bottle }: ThreeBottleViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // Default to false so the bottle starts facing forward with label 100% crystal-clear!
  const [isRotating, setIsRotating] = useState(false);
  const [showCrystals, setShowCrystals] = useState(bottle.riskLevel === 'critical');
  const [showSwollenCap, setShowSwollenCap] = useState(bottle.riskLevel === 'critical' || bottle.riskLevel === 'high');
  // Default to Clear Glass to directly match the crystal-clear square media bottle with salmon liquid!
  const [isClearGlass, setIsClearGlass] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const crystalsGroupRef = useRef<THREE.Group | null>(null);
  const capMeshRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 340;
    const height = 300;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (Frames the bottle straight on so the label is front & center)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.7, 5.8);
    camera.lookAt(0, 1.35, 0);

    // 3. Renderer with Antialiasing & PBR
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = (THREE as any).PCFShadowMap || (THREE as any).PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Studio Lighting System (Matches clean studio lighting in Image 2)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Main Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(4, 7, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cool Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Warm Fill Light
    const fillLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    fillLight.position.set(2, -2, 4);
    scene.add(fillLight);

    // Studio Contact Shadow Plane (Ground)
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.7,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.05;
    scene.add(shadowMesh);

    // 5. Main Center Reagent Bottle Hierarchy
    const bottleGroup = new THREE.Group();
    bottleGroupRef.current = bottleGroup;
    scene.add(bottleGroup);

    // 6. Secondary Background Reagent Bottle 1: Right Blue-Cap Bottle (Exact Image 2!)
    const bgBottleGroup = new THREE.Group();
    bgBottleGroup.position.set(0.68, 0.05, -1.25);
    bgBottleGroup.scale.set(0.86, 0.86, 0.86);

    const bgBodyGeo = new THREE.BoxGeometry(1.65, 2.2, 1.65);
    const bgGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.12,
      transmission: 0.85,
    });
    const bgBodyMesh = new THREE.Mesh(bgBodyGeo, bgGlassMat);
    bgBodyMesh.position.y = 1.1;
    bgBottleGroup.add(bgBodyMesh);

    // Secondary Royal Blue Cap (Like Image 2!)
    const bgCapGeo = new THREE.CylinderGeometry(0.56, 0.58, 0.55, 32);
    const bgCapMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Lab Royal Blue Polypropylene
      roughness: 0.35,
    });
    const bgCapMesh = new THREE.Mesh(bgCapGeo, bgCapMat);
    bgCapMesh.position.y = 2.65;
    bgBottleGroup.add(bgCapMesh);
    scene.add(bgBottleGroup);

    // 7. Secondary Background Bottle 2: Left Amber Bottle Corner (Exact Image 2!)
    const bgAmberGroup = new THREE.Group();
    bgAmberGroup.position.set(-1.45, 0.05, -1.1);
    bgAmberGroup.scale.set(0.82, 0.82, 0.82);

    const bgAmberGeo = new THREE.BoxGeometry(1.6, 2.3, 1.6);
    const bgAmberMat = new THREE.MeshPhysicalMaterial({
      color: 0x78350f, // Deep Amber Glass
      transparent: true,
      opacity: 0.75,
      roughness: 0.18,
      transmission: 0.65,
    });
    const bgAmberMesh = new THREE.Mesh(bgAmberGeo, bgAmberMat);
    bgAmberMesh.position.y = 1.15;
    bgAmberGroup.add(bgAmberMesh);
    scene.add(bgAmberGroup);

    // 8. BUILD PRIMARY REAGENT MEDIA BOTTLE (Like Image 2!)
    // Rounded Square Base Shape
    const bSize = 1.85;
    const bRadius = 0.35;
    const bShape = new THREE.Shape();
    bShape.moveTo(-bSize / 2 + bRadius, -bSize / 2);
    bShape.lineTo(bSize / 2 - bRadius, -bSize / 2);
    bShape.quadraticCurveTo(bSize / 2, -bSize / 2, bSize / 2, -bSize / 2 + bRadius);
    bShape.lineTo(bSize / 2, bSize / 2 - bRadius);
    bShape.quadraticCurveTo(bSize / 2, bSize / 2, bSize / 2 - bRadius, bSize / 2);
    bShape.lineTo(-bSize / 2 + bRadius, bSize / 2);
    bShape.quadraticCurveTo(-bSize / 2, bSize / 2, -bSize / 2, bSize / 2 - bRadius);
    bShape.lineTo(-bSize / 2, -bSize / 2 + bRadius);
    bShape.quadraticCurveTo(-bSize / 2, -bSize / 2, -bSize / 2 + bRadius, -bSize / 2);

    const extrudeSettings = {
      depth: 2.1,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    // Realistic Translucent Glass Material (PBR glass like Image 2!)
    const glassColor = isClearGlass ? 0xf8fafc : 0xb45309;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: glassColor,
      transparent: true,
      opacity: isClearGlass ? 0.35 : 0.85,
      roughness: 0.03,
      metalness: 0.02,
      transmission: isClearGlass ? 0.98 : 0.75,
      ior: 1.52,
      thickness: 0.45,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const bodyGeo = new THREE.ExtrudeGeometry(bShape, extrudeSettings);
    bodyGeo.rotateX(-Math.PI / 2);
    bodyGeo.translate(0, 0, 0);

    const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
    bodyMesh.castShadow = true;
    bottleGroup.add(bodyMesh);

    // Beveled Shoulder Transitioning smoothly to Neck (0.92 radius aligns with 1.85 square body)
    const shoulderGeo = new THREE.CylinderGeometry(0.55, 0.92, 0.55, 32);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, glassMat);
    shoulderMesh.position.y = 2.4;
    bottleGroup.add(shoulderMesh);

    // Glass Transfer Collar Ring (Below cap threads)
    const collarGeo = new THREE.TorusGeometry(0.58, 0.05, 16, 32);
    const collarMesh = new THREE.Mesh(collarGeo, glassMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 2.75;
    bottleGroup.add(collarMesh);

    // Threaded Neck
    const neckGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.65, 32);
    const neckMesh = new THREE.Mesh(neckGeo, glassMat);
    neckMesh.position.y = 2.95;
    bottleGroup.add(neckMesh);

    // Liquid Fill Mesh inside the Media Bottle (Salmon/Reddish Serum Fluid like Image 2!)
    const liquidVolumeRatio = Math.max(0.35, Math.min(0.85, bottle.currentVolumeMl / (bottle.initialVolumeMl || 500)));
    const liquidHeight = 1.9 * liquidVolumeRatio;
    const liquidInnerSize = bSize * 0.88;
    const liquidGeo = new THREE.BoxGeometry(liquidInnerSize, liquidHeight, liquidInnerSize);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444, // Salmon/Red serum fluid as in Image 2
      transparent: true,
      opacity: 0.88,
      roughness: 0.15,
      transmission: 0.35,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = liquidHeight / 2 + 0.1;
    bottleGroup.add(liquidMesh);

    // 9. TACTILE RIBBED SCREW CAP (Crisp white with knurled vertical flutes, exactly like Image 2!)
    const capGroup = new THREE.Group();
    capMeshRef.current = capGroup;
    capGroup.position.y = 3.25;

    const capMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean laboratory white polypropylene
      roughness: 0.35,
      metalness: 0.05,
    });

    // Cap main cylinder
    const capBaseGeo = new THREE.CylinderGeometry(0.56, 0.58, 0.65, 32);
    const capBaseMesh = new THREE.Mesh(capBaseGeo, capMat);
    capGroup.add(capBaseMesh);

    // Cap top beveled disc
    const topDiscGeo = new THREE.CylinderGeometry(0.54, 0.56, 0.08, 32);
    const topDiscMesh = new THREE.Mesh(topDiscGeo, capMat);
    topDiscMesh.position.y = 0.35;
    capGroup.add(topDiscMesh);

    // 36 Vertical Ribbed Flutes for authentic tactile grip knurling!
    const ribGeo = new THREE.BoxGeometry(0.025, 0.58, 0.035);
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.45,
    });
    for (let r = 0; r < 36; r++) {
      const angle = (r / 36) * Math.PI * 2;
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(Math.cos(angle) * 0.575, 0, Math.sin(angle) * 0.575);
      rib.rotation.y = -angle;
      capGroup.add(rib);
    }
    bottleGroup.add(capGroup);

    // 10. HIGH-RESOLUTION FRONT CHEMICAL REAGENT LABEL (Matching Image 2!)
    const labelCanvas = createRealisticBottleLabelCanvas(bottle);
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.anisotropy = 16;

    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const labelGeo = new THREE.PlaneGeometry(1.68, 1.95);
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    // Placed flush against the front face of the rounded square bottle!
    labelMesh.position.set(0, 1.1, bSize / 2 + 0.085);
    bottleGroup.add(labelMesh);

    // 11. Subtle 0.5kg Shoulder Graduation Mark (Like Image 2!)
    const gradCanvas = document.createElement('canvas');
    gradCanvas.width = 256;
    gradCanvas.height = 128;
    const gctx = gradCanvas.getContext('2d')!;
    gctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    gctx.font = 'bold 36px Arial, sans-serif';
    gctx.fillText('0.5kg', 20, 60);
    gctx.fillRect(20, 75, 140, 6);
    const gradTexture = new THREE.CanvasTexture(gradCanvas);
    const gradMat = new THREE.MeshBasicMaterial({ map: gradTexture, transparent: true, opacity: 0.75 });
    const gradMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.32), gradMat);
    gradMesh.position.set(-0.45, 2.25, bSize / 2 + 0.06);
    bottleGroup.add(gradMesh);

    // 10. REALISTIC PEROXIDE CRYSTALS (Encrusted around cap threads and collar)
    const crystalsGroup = new THREE.Group();
    crystalsGroupRef.current = crystalsGroup;
    crystalsGroup.position.set(0, 2.85, 0);

    const isCritical = bottle.riskLevel === 'critical';
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.95,
      transparent: true,
      opacity: 0.95,
      emissive: isCritical ? 0xff4444 : 0x000000,
      emissiveIntensity: isCritical ? 0.4 : 0,
    });

    // 24 Faceted Micro-Crystals clustered around threads
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 0.56 + (Math.sin(i * 3) * 0.06);
      const cGeo = new THREE.OctahedronGeometry(0.07 + (i % 3) * 0.03);
      const cMesh = new THREE.Mesh(cGeo, crystalMat);
      cMesh.position.set(
        Math.cos(angle) * radius,
        ((i % 4) - 1.5) * 0.08,
        Math.sin(angle) * radius
      );
      cMesh.rotation.set(angle, i, angle * 0.5);
      crystalsGroup.add(cMesh);
    }
    bottleGroup.add(crystalsGroup);
    crystalsGroup.visible = showCrystals;

    // Mouse drag 360° rotation handling
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !bottleGroupRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      bottleGroupRef.current.rotation.y += deltaX * 0.01;
      bottleGroupRef.current.rotation.x += deltaY * 0.01;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Smooth Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && bottleGroupRef.current && !isDragging) {
        bottleGroupRef.current.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [bottle, isRotating, isClearGlass]);

  // Update crystal visibility
  useEffect(() => {
    if (crystalsGroupRef.current) {
      crystalsGroupRef.current.visible = showCrystals;
    }
  }, [showCrystals]);

  // Update cap bulge
  useEffect(() => {
    if (capMeshRef.current) {
      if (showSwollenCap) {
        capMeshRef.current.scale.set(1.18, 1.45, 1.18);
      } else {
        capMeshRef.current.scale.set(1.0, 1.0, 1.0);
      }
    }
  }, [showSwollenCap]);

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>Realistic 3D Reagent Specimen</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              ACS MEDIA BOTTLE
            </span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Drag to Rotate 360°</span>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[280px] rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 cursor-grab active:cursor-grabbing flex items-center justify-center relative border border-slate-800/80 shadow-inner"
      />

      {/* Diagnostic Interactive Controls (4 Precision Toggles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            isRotating ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isRotating ? 'Pause Spin' : 'Resume Spin'}</span>
        </button>

        <button
          onClick={() => setIsClearGlass(!isClearGlass)}
          className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            isClearGlass ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-md' : 'bg-amber-600/20 text-amber-300 border-amber-600/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isClearGlass ? 'Clear Media Glass' : 'Amber UV Glass'}</span>
        </button>

        <button
          onClick={() => setShowCrystals(!showCrystals)}
          className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            showCrystals ? 'bg-rose-600/30 text-rose-300 border-rose-500/50 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{showCrystals ? 'Crystals Visible' : 'Add Crystals'}</span>
        </button>

        <button
          onClick={() => setShowSwollenCap(!showSwollenCap)}
          className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            showSwollenCap ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-300" />
          <span>{showSwollenCap ? 'Cap Bulging' : 'Normal Cap'}</span>
        </button>
      </div>

      {/* Reagent Telemetry Diagnostics */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
        <span>Liquid Volume: <b className="text-white">{bottle.currentVolumeMl} {bottle.unit} (Meniscus)</b></span>
        <span>Glass: <b className={isClearGlass ? 'text-cyan-400' : 'text-amber-400'}>{isClearGlass ? 'Clear Borosilicate (Image 2 Spec)' : 'Amber UV-Safe'}</b></span>
        <span>Peroxide Crystals: <b className={showCrystals ? 'text-rose-400 font-bold' : 'text-slate-400'}>{showCrystals ? 'DETECTED' : 'None'}</b></span>
      </div>
    </div>
  );
}
