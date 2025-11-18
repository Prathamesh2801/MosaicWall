import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * ImageGlobe
 *
 * Props:
 *  - images: array of image URLs (optional). If not provided, component uses generated canvas textures.
 *  - imageCount: number of generated images when images prop not supplied (default 12)
 *  - rotateSpeed: base rotation speed multiplier (default 0.5)
 *  - idleDuration: time (s) to stay in rotating/idle state before disassembling (default 4)
 *  - disassembleDuration: time (s) for disassemble animation (default 2.5)
 *  - reassembleDuration: time (s) for reassemble animation (default 2.5)
 *  - vortex: boolean — enable vortex motion during rotating state (default false)
 *  - vortexStrength: number — multiplier for vortex displacement (default 0.4)
 *  - vortexFrequency: number — frequency of vortex oscillation (default 1.2)
 *  - interactive: boolean — enables OrbitControls for mouse/touch interaction (default true)
 *  - pauseOnHover: boolean — pause animation when hovering over canvas (default true)
 *  - autoPlay: boolean — whether animation auto-starts (default true)
 */
const ImageGlobe = ({
  images = null,
  imageCount = 12,
  rotateSpeed = 0.9,
  idleDuration = 10,
  disassembleDuration = 4.5,
  reassembleDuration = 5.5,
  vortex = true,
  vortexStrength = 0.4,
  vortexFrequency = 2.3,
  interactive = true,
  pauseOnHover = false,
  autoPlay = true,
}) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const controlsRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [animationState, setAnimationState] = useState("rotating");
  const [vortexOn, setVortexOn] = useState(vortex);
  const [speed, setSpeed] = useState(rotateSpeed); // runtime speed control

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Basic scene/camera/renderer setup ---
    const width = Math.max(1, mountRef.current.clientWidth);
    const height = Math.max(1, mountRef.current.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.pointerEvents = "auto";

    // prevent overlay duplicates (hot reload)
    const existing = mountRef.current.querySelector("canvas");
    if (existing) mountRef.current.removeChild(existing);

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // texture helpers
    const createCanvasTexture = (index, total) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      const hue = (index / Math.max(1, total)) * 360;
      gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 40%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(256, 256, i * 48 + 20, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 44px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Photo ${index + 1}`, 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    };

    const textures = [];
    const loader = new THREE.TextureLoader();
    const loadingPromises = [];

    if (images && images.length > 0) {
      const count = Math.min(images.length, imageCount);
      for (let i = 0; i < count; i++) {
        const url = images[i];
        const p = new Promise((resolve) => {
          loader.load(
            url,
            (tex) => {
              tex.encoding = THREE.sRGBEncoding;
              tex.needsUpdate = true;
              textures.push(tex);
              resolve();
            },
            undefined,
            () => {
              textures.push(createCanvasTexture(i, imageCount));
              resolve();
            }
          );
        });
        loadingPromises.push(p);
      }
      for (let i = images.length; i < imageCount; i++) {
        textures.push(createCanvasTexture(i, imageCount));
      }
    } else {
      for (let i = 0; i < imageCount; i++) {
        textures.push(createCanvasTexture(i, imageCount));
      }
    }

    const whenReady = Promise.all(loadingPromises.length ? loadingPromises : [Promise.resolve()]);

    // --- meshes ---
    const imageMeshes = [];
    const radius = 10;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    whenReady.then(() => {
      const numImages = textures.length || imageCount;
      for (let i = 0; i < numImages; i++) {
        const geometry = new THREE.PlaneGeometry(3, 3);
        const tex = textures[i] || createCanvasTexture(i, numImages);
        const material = new THREE.MeshStandardMaterial({
          map: tex,
          side: THREE.DoubleSide,
          metalness: 0.2,
          roughness: 0.5,
          transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);

        const t = i / Math.max(1, numImages);
        const inclination = Math.acos(1 - 2 * t);
        const azimuth = angleIncrement * i;

        const x = radius * Math.sin(inclination) * Math.cos(azimuth);
        const y = radius * Math.sin(inclination) * Math.sin(azimuth);
        const z = radius * Math.cos(inclination);

        mesh.position.set(x, y, z);
        mesh.lookAt(0, 0, 0);

        mesh.userData = {
          originalPosition: new THREE.Vector3(x, y, z).clone(),
          disassembledPosition: new THREE.Vector3(x * 2.8, y * 2.8, z * 2.8).clone(),
          originalRotation: mesh.rotation.clone(),
          azimuth,
          inclination,
          baseRadius: radius,
        };

        scene.add(mesh);
        imageMeshes.push(mesh);
      }

      setIsReady(true);
    });

    // OrbitControls (optional interactive)
    let controls = null;
    if (interactive) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controlsRef.current = controls;
    }

    // Animation control refs/state
    let time = 0;
    let currentState = "rotating";
    let stateTimer = 0;
    let paused = !autoPlay;

    // Respect top-level play/pause
    setIsPlaying(!paused);

    // pause/resume helper
    const setPaused = (p) => {
      paused = !!p;
      setIsPlaying(!paused);
    };

    // pointer hover for pause
    const pointerHandlers = {
      enter: () => {
        if (pauseOnHover) setPaused(true);
      },
      leave: () => {
        if (pauseOnHover && autoPlay) setPaused(false);
      },
    };
    renderer.domElement.addEventListener("pointerenter", pointerHandlers.enter);
    renderer.domElement.addEventListener("pointerleave", pointerHandlers.leave);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      if (controls) controls.update();

      if (!isPlaying) {
        renderer.render(scene, camera);
        return;
      }

      // wait until meshes are populated
      if (imageMeshes.length === 0) {
        renderer.render(scene, camera);
        return;
      }

      // advance timers
      if (!paused) {
        time += 0.016 * speed;
        stateTimer += 0.016 * speed;
      }

      if (currentState === "rotating") {
        // rotating + optional vortex effect
        imageMeshes.forEach((mesh) => {
          const pos = mesh.userData.originalPosition;
          // base rotation around Y axis
          const angle = time * 0.5 * speed;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const rotatedX = pos.x * cos - pos.z * sin;
          const rotatedZ = pos.z * cos + pos.x * sin;

          let rx = rotatedX;
          let ry = pos.y;
          let rz = rotatedZ;

          if (vortexOn) {
            // implement a vortex: modulate radius using azimuth and a sin wave over time
            // compute original polar coordinates
            const az = mesh.userData.azimuth;
            const baseR = mesh.userData.baseRadius;
            // create a small radial inward/outward oscillation
            const oscillation = Math.sin(time * vortexFrequency + az) * vortexStrength * (1.0 - Math.abs(pos.y) / (radius + 0.0001));
            const r = Math.sqrt(rotatedX * rotatedX + rotatedZ * rotatedZ);
            const newR = Math.max(0.5, r + oscillation * baseR * 0.3);
            // compute normalized direction
            const dirX = rotatedX / r || 1;
            const dirZ = rotatedZ / r || 0;
            rx = dirX * newR;
            rz = dirZ * newR;

            // gentle spin tilt
            mesh.rotation.x += 0.002 * speed;
            mesh.rotation.y += 0.003 * speed;
          } else {
            // slight idle bob for non-vortex
            mesh.rotation.x += 0.001 * Math.sin(time * 0.7) * speed;
            mesh.rotation.y += 0.001 * Math.cos(time * 0.6) * speed;
          }

          mesh.position.set(rx, ry, rz);
          mesh.lookAt(0, 0, 0);
        });

        if (stateTimer > idleDuration) {
          currentState = "disassembling";
          stateTimer = 0;
          setAnimationState("disassembling");
        }
      } else if (currentState === "disassembling") {
        const duration = disassembleDuration;
        const progress = Math.min(stateTimer / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        imageMeshes.forEach((mesh) => {
          const start = mesh.userData.originalPosition;
          const end = mesh.userData.disassembledPosition;
          mesh.position.lerpVectors(start, end, eased);
          mesh.rotation.x += 0.04 * (1 - eased) * speed;
          mesh.rotation.y += 0.04 * (1 - eased) * speed;
          mesh.rotation.z += 0.02 * (1 - eased) * speed;
        });

        if (progress >= 1) {
          currentState = "reassembling";
          stateTimer = 0;
          setAnimationState("reassembling");
        }
      } else if (currentState === "reassembling") {
        const duration = reassembleDuration;
        const progress = Math.min(stateTimer / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        imageMeshes.forEach((mesh) => {
          const start = mesh.userData.disassembledPosition;
          const end = mesh.userData.originalPosition;
          mesh.position.lerpVectors(start, end, eased);
          // reduce rotation gradually
          mesh.rotation.x *= 1 - eased * 0.15;
          mesh.rotation.y *= 1 - eased * 0.15;
          mesh.rotation.z *= 1 - eased * 0.15;

          if (progress > 0.8) {
            const targetRotation = mesh.userData.originalRotation;
            mesh.rotation.x += (targetRotation.x - mesh.rotation.x) * 0.1;
            mesh.rotation.y += (targetRotation.y - mesh.rotation.y) * 0.1;
            mesh.rotation.z += (targetRotation.z - mesh.rotation.z) * 0.1;
            mesh.lookAt(0, 0, 0);
          }
        });

        if (progress >= 1) {
          currentState = "rotating";
          time = 0;
          stateTimer = 0;
          setAnimationState("rotating");
          imageMeshes.forEach((mesh) => {
            mesh.rotation.copy(mesh.userData.originalRotation);
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // handle resize
    const onResize = () => {
      if (!mountRef.current) return;
      const w = Math.max(1, mountRef.current.clientWidth);
      const h = Math.max(1, mountRef.current.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerenter", pointerHandlers.enter);
      renderer.domElement.removeEventListener("pointerleave", pointerHandlers.leave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (controls) {
        controls.dispose();
        controlsRef.current = null;
      }

      imageMeshes.forEach((mesh) => {
        try {
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (mesh.material.map) mesh.material.map.dispose();
            mesh.material.dispose();
          }
          scene.remove(mesh);
        } catch (e) {}
      });

      textures.forEach((t) => {
        try {
          if (t && typeof t.dispose === "function") t.dispose();
        } catch (e) {}
      });

      try {
        if (rendererRef.current && mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        if (rendererRef.current) rendererRef.current.dispose();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, imageCount]); // only re-run when image list / count changes

  // runtime controls (UI)
  const togglePlay = () => setIsPlaying((p) => !p);
  const toggleVortex = () => setVortexOn((v) => !v);
  const onSpeedChange = (e) => setSpeed(Number(e.target.value));

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden">
      <div ref={mountRef} className="w-full h-full relative" />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 pointer-events-none">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white">Initializing 3D Globe...</p>
          </div>
        </div>
      )}

      {/* small control panel */}
      <div className="absolute right-6 top-6 z-30 bg-black/60 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={togglePlay}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
            aria-label="Play/Pause"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={toggleVortex}
            className={`px-3 py-1 rounded ${vortexOn ? "bg-blue-500" : "bg-white/10"}`}
            aria-label="Toggle Vortex"
          >
            Vortex
          </button>
        </div>

        <div className="flex flex-col text-xs">
          <label className="text-slate-300 mb-1">Speed: {speed.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={onSpeedChange}
            className="w-36"
          />
        </div>

        <div className="text-xs text-slate-300">
          <div>State: <span className="font-medium text-white">{animationState}</span></div>
        </div>
      </div>

      {/* bottom-left info */}
      <div className="absolute left-6 bottom-6 text-slate-300 text-xs z-20">
        <div>Three.js • {imageCount} images • {interactive ? "Interactive" : "Static"}</div>
      </div>
    </div>
  );
};

export default ImageGlobe;
