'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Beaker, 
  ShieldAlert, 
  Layers,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { ChemicalBottle } from '@/types/chemical';

interface ThreeLaboratoryCabinetProps {
  bottles: ChemicalBottle[];
  selectedBottle: ChemicalBottle | null;
  onSelectBottle: (bottle: ChemicalBottle) => void;
  hasCollision?: boolean;
  selectedSchoolName?: string;
}

export type CabinetId = 'cabinet-a' | 'cabinet-b' | 'cabinet-c';
export type ShelfFilter = 'all' | 'shelf-1' | 'shelf-2' | 'shelf-3';

// Procedural Handcrafted Dark Mahogany Wood Grain Texture (Directly reproduces Image 1)
function createMahoganyWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base Rich Dark Mahogany Brown (Image 1 Color)
  ctx.fillStyle = '#3a1711';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Horizontal and vertical timber growth rings & fibers
  for (let y = 0; y < 1024; y++) {
    const grainFreq = Math.sin(y * 0.08) * 0.35 + Math.sin(y * 0.02) * 0.65;
    const alpha = 0.09 + Math.abs(grainFreq) * 0.16;
    ctx.fillStyle = grainFreq > 0 ? `rgba(92, 38, 28, ${alpha})` : `rgba(28, 10, 6, ${alpha})`;
    ctx.fillRect(0, y, 1024, 1);
  }

  // 3. Realistic Wood Fibers & Flecks
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const w = 60 + Math.random() * 240;
    const h = 1 + Math.random() * 2.5;
    ctx.fillStyle = Math.random() > 0.45 ? 'rgba(115, 48, 35, 0.14)' : 'rgba(18, 6, 4, 0.18)';
    ctx.fillRect(x, y, w, h);
  }

  // 4. Subtle Satin Wood Finish Highlights
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

// Miniature Reagent Bottle Label Generator
function createMiniLabelTexture(name: string, isHazard: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 256, 320);

  // Border & Accent bar
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 312);

  ctx.fillStyle = isHazard ? '#DC2626' : '#2563EB';
  ctx.fillRect(6, 6, 244, 16);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('ACS GRADE', 18, 52);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(name.slice(0, 14), 18, 86);

  // Red Hazard Circle
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 150, 42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(116, 130, 24, 40);

  // QR Mini Matrix
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(88, 220, 80, 80);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(98, 230, 60, 60);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(108, 240, 40, 40);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function ThreeLaboratoryCabinet({
  bottles,
  selectedBottle,
  onSelectBottle,
  hasCollision = false,
  selectedSchoolName,
}: ThreeLaboratoryCabinetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeCabinet, setActiveCabinet] = useState<CabinetId>('cabinet-b'); // Default to Cabinet B (shows Ether Peroxide hazard)
  const [activeShelf, setActiveShelf] = useState<ShelfFilter>('all');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [viewAngle, setViewAngle] = useState<'front' | 'isometric' | 'top'>('front');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cabinetGroupRef = useRef<THREE.Group | null>(null);
  const bottleMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);

  // Cabinet Metadata Configuration
  const cabinets = {
    'cabinet-a': {
      name: 'Cabinet A: Acids & Mineral Reagents',
      shortName: 'Cabinet A (Acids)',
      type: 'Corrosion-Resistant Polyethylene',
      colorHex: 0x0f172a,
      frameColorHex: 0x1e293b,
      ledColorHex: 0x06b6d4, // Cyan
      badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
      description: 'Dedicated inorganic mineral acids. Polyethylene spill lip trays prevent cross-corrosion.',
      shelves: {
        'shelf-1': { title: 'Shelf 1 (Top Shelf)', role: 'Concentrated Mineral Acids (HCl 37%, HNO3 70%)', status: 'Incompatibility Alert' },
        'shelf-2': { title: 'Shelf 2 (Mid Shelf)', role: 'Dilute Acids & Inorganic Standards', status: 'Compliant' },
        'shelf-3': { title: 'Shelf 3 (Bottom Spill Lip)', role: 'Limestone / Sodium Bicarbonate Neutralizer Bins', status: 'Safety Floor' },
      }
    },
    'cabinet-b': {
      name: 'Cabinet B: Flammables & Solvents',
      shortName: 'Cabinet B (Flammables)',
      type: 'Yellow Explosion-Proof Fire Steel',
      colorHex: 0x78350f,
      frameColorHex: 0xd97706, // Amber yellow steel
      ledColorHex: 0xf59e0b, // Amber
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
      description: 'Fire-rated steel cabinet with flame arrestors. Contains Class B peroxide formers & volatile solvents.',
      shelves: {
        'shelf-1': { title: 'Shelf 1 (Top Shelf)', role: 'Low Flashpoint Solvents (Acetone 99%, Ethanol)', status: 'Compliant' },
        'shelf-2': { title: 'Shelf 2 (Mid Shelf)', role: 'Class B Peroxide Formers (🚨 Diethyl Ether - Crystals Detected)', status: 'CRITICAL DETONATION RISK' },
        'shelf-3': { title: 'Shelf 3 (Bottom Spill Lip)', role: 'Vermiculite Non-Sparking Spill Cushions', status: 'Safety Floor' },
      }
    },
    'cabinet-c': {
      name: 'Cabinet C: Bases, Alkalis & Neutral Salts',
      shortName: 'Cabinet C (Bases & Salts)',
      type: 'Epoxy-Coated Alkali Resistant',
      colorHex: 0x1e1b4b,
      frameColorHex: 0x4338ca, // Deep indigo purple
      ledColorHex: 0x818cf8, // Indigo
      badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/40',
      description: 'Dedicated alkali storage. Isolated from acids to avoid violent exothermic neutralization.',
      shelves: {
        'shelf-1': { title: 'Shelf 1 (Top Shelf)', role: 'Neutral Inorganic Salts (CaCl2, NaCl, Buffer Salts)', status: 'Compliant' },
        'shelf-2': { title: 'Shelf 2 (Mid Shelf)', role: 'Weak Alkalis & Ammonia Solution 25%', status: 'Compliant' },
        'shelf-3': { title: 'Shelf 3 (Bottom Spill Lip)', role: 'Heavy Caustic Solids (Sodium Hydroxide Pellets)', status: 'Deliquescence Monitored' },
      }
    }
  };

  const currentCabinetMeta = cabinets[activeCabinet];

  // Filter bottles belonging to current cabinet and shelf
  const filteredBottles = bottles.filter(bot => {
    const group = (bot.chemical?.storageGroup || '').toLowerCase();
    const isPeroxide = bot.chemical?.peroxideClass && bot.chemical.peroxideClass !== 'none';
    const isAcid = group.includes('acid') || group.includes('oxidizer') || bot.chemical?.canonicalName.includes('Acid');
    const isFlammable = group.includes('flammable') || isPeroxide || bot.chemical?.canonicalName.includes('Ether') || bot.chemical?.canonicalName.includes('Acetone');
    const isBase = group.includes('base') || group.includes('salt') || bot.chemical?.canonicalName.includes('Hydroxide');

    let botCabinet: CabinetId = 'cabinet-a';
    let botShelf: 'shelf-1' | 'shelf-2' | 'shelf-3' = 'shelf-1';

    if (isAcid) {
      botCabinet = 'cabinet-a';
      botShelf = bot.chemical?.canonicalName.includes('Nitric') ? 'shelf-1' : 'shelf-2';
    } else if (isFlammable) {
      botCabinet = 'cabinet-b';
      botShelf = isPeroxide ? 'shelf-2' : 'shelf-1';
    } else if (isBase) {
      botCabinet = 'cabinet-c';
      botShelf = group.includes('base') ? 'shelf-3' : 'shelf-1';
    }

    const matchesCabinet = botCabinet === activeCabinet;
    const matchesShelf = activeShelf === 'all' || botShelf === activeShelf;

    return matchesCabinet && matchesShelf;
  });

  // 3D Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 440;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. CAMERA SETUP (Directly frames the handcrafted cabinet like Image 1)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.1, 8.2);
    camera.lookAt(0, 2.1, 0);
    cameraRef.current = camera;

    // 3. RENDERER WITH WEBGL SHADOWS
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = (THREE as any).PCFShadowMap || (THREE as any).PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. LIGHTING SYSTEM
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainKeyLight.position.set(5, 8, 7);
    mainKeyLight.castShadow = true;
    scene.add(mainKeyLight);

    // Cabinet-Specific Atmospheric Glow
    const cabinetGlow = new THREE.PointLight(
      currentCabinetMeta.ledColorHex,
      activeCabinet === 'cabinet-b' ? 4.0 : 2.5,
      14
    );
    cabinetGlow.position.set(0, 3, 2);
    scene.add(cabinetGlow);

    // 5. CABINET 3D PHYSICAL SHELL (Image 1 Handcrafted Dark Mahogany Cabinet)
    const cabinetGroup = new THREE.Group();
    cabinetGroupRef.current = cabinetGroup;
    scene.add(cabinetGroup);

    const woodTex = createMahoganyWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x4a1d17, // Rich deep mahogany reddish-brown (Image 1)
      roughness: 0.38,
      metalness: 0.06,
    });

    const trimWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x3d1610,
      roughness: 0.32,
      metalness: 0.08,
    });

    // Solid Mahogany Back Wall (Image 1)
    const backWallGeo = new THREE.BoxGeometry(5.7, 4.4, 0.14);
    const backWall = new THREE.Mesh(backWallGeo, woodMat);
    backWall.position.set(0, 2.1, -1.05);
    backWall.receiveShadow = true;
    cabinetGroup.add(backWall);

    // Left & Right Thick Wooden Pillars / Side Panels (Image 1)
    const sidePanelGeo = new THREE.BoxGeometry(0.28, 4.4, 2.15);
    const leftPanel = new THREE.Mesh(sidePanelGeo, woodMat);
    leftPanel.position.set(-2.85, 2.1, 0.02);
    leftPanel.castShadow = true;
    cabinetGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(sidePanelGeo, woodMat);
    rightPanel.position.set(2.85, 2.1, 0.02);
    rightPanel.castShadow = true;
    cabinetGroup.add(rightPanel);

    // CROWN MOLDING AT TOP (Protruding Cornice Header - Exact Image 1!)
    // 1. Top Cornice Overhang
    const crownTop = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.22, 2.35), trimWoodMat);
    crownTop.position.set(0, 4.38, 0.05);
    cabinetGroup.add(crownTop);

    // 2. Beveled Cornice Middle Step
    const crownMid = new THREE.Mesh(new THREE.BoxGeometry(6.15, 0.2, 2.22), trimWoodMat);
    crownMid.position.set(0, 4.19, 0.04);
    cabinetGroup.add(crownMid);

    // 3. Cornice Neck Band Trim
    const crownNeck = new THREE.Mesh(new THREE.BoxGeometry(5.92, 0.12, 2.14), trimWoodMat);
    crownNeck.position.set(0, 4.04, 0.03);
    cabinetGroup.add(crownNeck);

    // BASE PLINTH AT BOTTOM (Stepped Solid Footer - Exact Image 1!)
    // 1. Upper Plinth Step
    const plinthTop = new THREE.Mesh(new THREE.BoxGeometry(5.95, 0.16, 2.14), trimWoodMat);
    plinthTop.position.set(0, 0.15, 0.03);
    cabinetGroup.add(plinthTop);

    // 2. Lower Plinth Base
    const plinthBase = new THREE.Mesh(new THREE.BoxGeometry(6.25, 0.24, 2.25), trimWoodMat);
    plinthBase.position.set(0, -0.05, 0.04);
    cabinetGroup.add(plinthBase);

    // 3. Sub-Base Floor Runner
    const plinthRunner = new THREE.Mesh(new THREE.BoxGeometry(6.45, 0.18, 2.35), trimWoodMat);
    plinthRunner.position.set(0, -0.24, 0.05);
    cabinetGroup.add(plinthRunner);

    // THREE SOLID MAHOGANY SHELVES (Exact Image 1 Shelf Placement)
    // Shelf 1 (Top Shelf): y = 3.25
    // Shelf 2 (Mid Shelf): y = 2.05
    // Shelf 3 (Bottom Spill Lip): y = 0.75
    const shelfConfigs = [
      { y: 3.25, name: 'shelf-1', thickness: 0.16 },
      { y: 2.05, name: 'shelf-2', thickness: 0.16 },
      { y: 0.75, name: 'shelf-3', thickness: 0.20 },
    ];

    shelfConfigs.forEach((shelf) => {
      // Solid Wooden Shelf Plank
      const shelfPlank = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, shelf.thickness, 2.08),
        woodMat
      );
      shelfPlank.position.set(0, shelf.y, 0.02);
      shelfPlank.receiveShadow = true;
      cabinetGroup.add(shelfPlank);

      // Beveled Shelf Front Bullnose Trim
      const shelfTrim = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, shelf.thickness + 0.02, 0.06),
        trimWoodMat
      );
      shelfTrim.position.set(0, shelf.y, 1.05);
      cabinetGroup.add(shelfTrim);

      // Subtle Under-Shelf Warm Amber Downlight
      const underLight = new THREE.PointLight(0xffedd5, 0.8, 2.5);
      underLight.position.set(0, shelf.y - 0.1, 0.2);
      cabinetGroup.add(underLight);
    });

    // 6. POPULATE CHEMICAL REAGENT BOTTLES IN 3D SPACE (Strictly actual school reagents, NO random fallback)
    bottleMeshesRef.current.clear();
    const displayBottles = filteredBottles;

    // If no bottles in this compartment, add a subtle brass/slate compliance plaque on shelf
    if (displayBottles.length === 0) {
      const plaqueGroup = new THREE.Group();
      const plaqueMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.7, 0.06),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.35,
          metalness: 0.5,
        })
      );
      plaqueMesh.position.set(0, 2.05, -0.9);
      plaqueGroup.add(plaqueMesh);

      // Text plane on plaque
      const cCanvas = document.createElement('canvas');
      cCanvas.width = 512;
      cCanvas.height = 120;
      const cCtx = cCanvas.getContext('2d');
      if (cCtx) {
        cCtx.fillStyle = '#090d16';
        cCtx.fillRect(0, 0, 512, 120);
        cCtx.strokeStyle = '#10b981';
        cCtx.lineWidth = 4;
        cCtx.strokeRect(6, 6, 500, 108);
        cCtx.fillStyle = '#10b981';
        cCtx.font = 'bold 22px monospace';
        cCtx.textAlign = 'center';
        cCtx.fillText('STATUS: ZERO CONTAMINANTS REGISTERED', 256, 48);
        cCtx.font = '16px monospace';
        cCtx.fillStyle = '#94a3b8';
        cCtx.fillText('Shelf compliant • No hazardous reagents present', 256, 84);
      }
      const cTex = new THREE.CanvasTexture(cCanvas);
      const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.1, 0.65),
        new THREE.MeshBasicMaterial({ map: cTex })
      );
      textPlane.position.set(0, 2.05, -0.86);
      plaqueGroup.add(textPlane);

      cabinetGroup.add(plaqueGroup);
    }

    // Group bottles by target shelf to position them neatly across X axis
    const shelfBottlesMap: Record<string, ChemicalBottle[]> = {
      'shelf-1': [],
      'shelf-2': [],
      'shelf-3': [],
    };

    displayBottles.forEach((bot) => {
      const group = (bot.chemical?.storageGroup || '').toLowerCase();
      const isPeroxide = bot.chemical?.peroxideClass && bot.chemical.peroxideClass !== 'none';
      const isAcid = group.includes('acid') || group.includes('oxidizer') || bot.chemical?.canonicalName.includes('Acid');
      const isFlammable = group.includes('flammable') || isPeroxide || bot.chemical?.canonicalName.includes('Ether');
      let targetShelf: 'shelf-1' | 'shelf-2' | 'shelf-3' = 'shelf-1';

      if (isAcid) {
        targetShelf = bot.chemical?.canonicalName.includes('Nitric') ? 'shelf-1' : 'shelf-2';
      } else if (isFlammable) {
        targetShelf = isPeroxide ? 'shelf-2' : 'shelf-1';
      } else {
        targetShelf = group.includes('base') ? 'shelf-3' : 'shelf-1';
      }

      shelfBottlesMap[targetShelf].push(bot);
    });

    displayBottles.forEach((bot, botIndex) => {
      const bottleGroup = new THREE.Group();

      const isPeroxide = bot.chemical?.peroxideClass && bot.chemical.peroxideClass !== 'none';
      const isCritical = bot.riskLevel === 'critical';
      const group = (bot.chemical?.storageGroup || '').toLowerCase();
      const isAcid = group.includes('acid') || group.includes('oxidizer') || bot.chemical?.canonicalName.includes('Acid');
      const isFlammable = group.includes('flammable') || isPeroxide || bot.chemical?.canonicalName.includes('Ether');

      let botShelf: 'shelf-1' | 'shelf-2' | 'shelf-3' = 'shelf-1';
      if (isAcid) {
        botShelf = bot.chemical?.canonicalName.includes('Nitric') ? 'shelf-1' : 'shelf-2';
      } else if (isFlammable) {
        botShelf = isPeroxide ? 'shelf-2' : 'shelf-1';
      } else {
        botShelf = group.includes('base') ? 'shelf-3' : 'shelf-1';
      }

      let shelfY = 2.05;
      if (botShelf === 'shelf-1') shelfY = 3.25;
      else if (botShelf === 'shelf-2') shelfY = 2.05;
      else if (botShelf === 'shelf-3') shelfY = 0.75;

      const peersOnShelf = shelfBottlesMap[botShelf];
      const peerIndex = peersOnShelf.indexOf(bot);
      const totalOnShelf = peersOnShelf.length;

      let xOffset = 0;
      if (totalOnShelf === 1) {
        xOffset = 0;
      } else if (totalOnShelf === 2) {
        xOffset = peerIndex === 0 ? -1.1 : 1.1;
      } else {
        const span = 3.4;
        const step = span / (totalOnShelf - 1);
        xOffset = -1.7 + peerIndex * step;
      }

      bottleGroup.position.set(xOffset, shelfY + 0.08, 0.1);

      // Miniature Square Media Bottle Body (Matching Image 2 Reference)
      const bWidth = 0.52;
      const bHeight = 0.68;
      const bottleBodyGeo = new THREE.BoxGeometry(bWidth, bHeight, bWidth);
      const isAmber = bot.chemical.isLightSensitive;
      const miniGlassMat = new THREE.MeshPhysicalMaterial({
        color: isAmber ? 0xb45309 : 0xf8fafc,
        transparent: true,
        opacity: isAmber ? 0.8 : 0.6,
        roughness: 0.08,
        transmission: isAmber ? 0.7 : 0.9,
      });
      const bottleMesh = new THREE.Mesh(bottleBodyGeo, miniGlassMat);
      bottleMesh.position.y = bHeight / 2;
      bottleMesh.castShadow = true;
      bottleGroup.add(bottleMesh);

      // Beveled Shoulder & Neck
      const shoulderGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.18, 20);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, miniGlassMat);
      shoulderMesh.position.y = bHeight + 0.08;
      bottleGroup.add(shoulderMesh);

      // Fluid Fill inside bottle
      const liquidGeo = new THREE.BoxGeometry(bWidth * 0.88, bHeight * 0.55, bWidth * 0.88);
      const liquidMat = new THREE.MeshPhysicalMaterial({
        color: isCritical ? 0xef4444 : isAmber ? 0xd97706 : 0x0284c7,
        transparent: true,
        opacity: 0.85,
        roughness: 0.2,
      });
      const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
      liquidMesh.position.y = (bHeight * 0.55) / 2 + 0.04;
      bottleGroup.add(liquidMesh);

      // Knurled Cap
      const capGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.2, 20);
      const capMat = new THREE.MeshStandardMaterial({
        color: isCritical ? 0xef4444 : botIndex % 2 === 0 ? 0xf8fafc : 0x1d4ed8, // White or Blue cap
        roughness: 0.4,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = bHeight + 0.26;
      bottleGroup.add(capMesh);

      // Miniature Label on Front
      const labelTex = createMiniLabelTexture(bot.chemical.canonicalName, isCritical);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: false });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.52), labelMat);
      labelMesh.position.set(0, bHeight / 2, bWidth / 2 + 0.015);
      bottleGroup.add(labelMesh);

      // White Peroxide Crystal Clusters (around neck collar)
      if (isCritical || isPeroxide) {
        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.08,
          metalness: 0.95,
        });

        for (let c = 0; c < 10; c++) {
          const crystalGeo = new THREE.OctahedronGeometry(0.04 + (c % 3) * 0.015);
          const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
          const angle = (c / 10) * Math.PI * 2;
          crystalMesh.position.set(
            Math.cos(angle) * 0.2,
            bHeight + 0.16 + (c % 3) * 0.02,
            Math.sin(angle) * 0.2
          );
          bottleGroup.add(crystalMesh);
        }

        // Emergency Hazard Halo on the Shelf Floor
        const hazardHalo = new THREE.Mesh(
          new THREE.RingGeometry(0.38, 0.46, 32),
          new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide })
        );
        hazardHalo.rotation.x = Math.PI / 2;
        hazardHalo.position.y = 0.01;
        bottleGroup.add(hazardHalo);

        // Emergency Spotlight on Shelf 2
        const hazardSpot = new THREE.PointLight(0xf43f5e, 3.2, 2.5);
        hazardSpot.position.set(0, 0.6, 0.4);
        bottleGroup.add(hazardSpot);
      }

      // Selection Aura
      if (selectedBottle?.id === bot.id) {
        const selHalo = new THREE.Mesh(
          new THREE.RingGeometry(0.44, 0.52, 32),
          new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
        );
        selHalo.rotation.x = Math.PI / 2;
        selHalo.position.y = 0.015;
        bottleGroup.add(selHalo);
      }

      bottleGroup.userData = { bottleId: bot.id, bottle: bot };
      cabinetGroup.add(bottleGroup);
      bottleMeshesRef.current.set(bot.id, bottleGroup);
    });

    // 7. SMOOTH ANIMATION / SWAY LOOP
    let angle = 0;
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (isAutoRotating && cabinetGroupRef.current) {
        angle += 0.003;
        cabinetGroupRef.current.rotation.y = Math.sin(angle) * 0.22;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newWidth = containerRef.current.clientWidth || 700;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (renderer) renderer.dispose();
    };
  }, [bottles, selectedBottle, activeCabinet, activeShelf, isAutoRotating]);

  // Camera Presets
  const setCameraAngle = (angleKey: 'front' | 'isometric' | 'top') => {
    setViewAngle(angleKey);
    setIsAutoRotating(false);
    if (!cameraRef.current || !cabinetGroupRef.current) return;

    if (angleKey === 'front') {
      cabinetGroupRef.current.rotation.y = 0;
      cameraRef.current.position.set(0, 2.1, 8.2);
    } else if (angleKey === 'isometric') {
      cabinetGroupRef.current.rotation.y = 0.35;
      cameraRef.current.position.set(3.5, 3.8, 8.5);
    } else if (angleKey === 'top') {
      cabinetGroupRef.current.rotation.y = 0;
      cameraRef.current.position.set(0, 7.8, 2.5);
    }
    cameraRef.current.lookAt(0, 2.1, 0);
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 overflow-hidden shadow-2xl space-y-3.5">
      {/* Cabinet Selector Tabs (Cabinet A, B, C) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
              WebGL 3D SPATIAL TWIN
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-400" />
              <span>Cabinet & Shelf 3D Super-Tracker</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time digital twin tracking placement, liquid levels, and peroxide crystal growth across secondary school cabinets.
          </p>
        </div>

        {/* Camera Angles */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
            <button
              onClick={() => setCameraAngle('front')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewAngle === 'front' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCameraAngle('isometric')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewAngle === 'isometric' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Perspective
            </button>
            <button
              onClick={() => setCameraAngle('top')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewAngle === 'top' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Plan
            </button>
          </div>

          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer ${
              isAutoRotating ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Toggle Auto-Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Cabinet Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => { setActiveCabinet('cabinet-a'); setActiveShelf('all'); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeCabinet === 'cabinet-a'
              ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-cyan-300">🗄️ Cabinet A (Acids)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">POLYETHYLENE</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Mineral Acids (HCl 37%, Nitric 70%)</span>
        </button>

        <button
          onClick={() => { setActiveCabinet('cabinet-b'); setActiveShelf('all'); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeCabinet === 'cabinet-b'
              ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-300">🗄️ Cabinet B (Flammables)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold animate-pulse">
              PEROXIDE DETECTED
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Solvents & Class B Ethers (🚨 Diethyl Ether)</span>
        </button>

        <button
          onClick={() => { setActiveCabinet('cabinet-c'); setActiveShelf('all'); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeCabinet === 'cabinet-c'
              ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-indigo-300">🗄️ Cabinet C (Bases & Salts)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">ALKALI EPOXY</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Bases (NaOH Pellets) & Neutral Salts</span>
        </button>
      </div>

      {/* Shelf-Wise Filter Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        <span className="text-[11px] font-bold text-slate-400 font-mono shrink-0 mr-1">Shelf Filter:</span>
        {(['all', 'shelf-1', 'shelf-2', 'shelf-3'] as const).map((sKey) => {
          const isSelected = activeShelf === sKey;
          const label = sKey === 'all' 
            ? 'All 3 Shelves' 
            : sKey === 'shelf-1' 
            ? 'Shelf 1 (Top Shelf)' 
            : sKey === 'shelf-2' 
            ? 'Shelf 2 (Mid Shelf)' 
            : 'Shelf 3 (Bottom Spill Lip)';

          return (
            <button
              key={sKey}
              onClick={() => setActiveShelf(sKey)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-emerald-400 text-emerald-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* WebGL 3D Container Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[440px] rounded-2xl bg-black/60 border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing"
      />

      {/* School Lab & Strict Inventory Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Institutional Twin:</span>
          <span className="font-bold text-white">{selectedSchoolName || 'Tamil Nadu Secondary School'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Verified Shelf Reagents:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            filteredBottles.length > 0 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {filteredBottles.length} Reagent{filteredBottles.length === 1 ? '' : 's'} Active (Strict Mode)
          </span>
        </div>
      </div>

      {/* Shelf-Wise Telemetry Breakdown Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
        {Object.entries(currentCabinetMeta?.shelves || {}).map(([sKey, sInfo], idx) => {
          const isHazardousShelf = activeCabinet === 'cabinet-b' && sKey === 'shelf-2';
          const isSelectedShelf = activeShelf === sKey || activeShelf === 'all';

          return (
            <div
              key={sKey}
              onClick={() => setActiveShelf(sKey as ShelfFilter)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isHazardousShelf
                  ? 'bg-rose-950/30 border-rose-500/50 hover:bg-rose-950/50'
                  : isSelectedShelf
                  ? 'bg-slate-900 border-slate-700 hover:border-emerald-500/50'
                  : 'bg-slate-950 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <span>Tier {idx + 1}: {sInfo.title}</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                  isHazardousShelf ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  {sInfo.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">{sInfo.role}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
