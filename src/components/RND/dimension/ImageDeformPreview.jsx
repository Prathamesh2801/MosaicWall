import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Repeat } from "lucide-react";

export default function ImageDeformPreview() {
  const [imageURL, setImageURL] = useState(null);
  const [currentAnimation, setCurrentAnimation] = useState("pixelSpin");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const fileInputRef = useRef(null);
  const completionTimerRef = useRef(null);

  // You can drop GRID_SIZE further (e.g. 12 or 10) for smoother perf on slow machines
  const GRID_SIZE = 12;

  const animations = [
    { id: "pixelSpin", name: "Pixel Spin", color: "from-purple-500 to-pink-500" },
    { id: "waveCollapse", name: "Wave Collapse", color: "from-blue-500 to-cyan-500" },
    { id: "spiralZoom", name: "Spiral Zoom", color: "from-green-500 to-emerald-500" },
    { id: "explosionGather", name: "Explosion Gather", color: "from-orange-500 to-red-500" },
    { id: "flipMosaic", name: "Flip Mosaic", color: "from-yellow-500 to-amber-500" },
    { id: "swirlDrop", name: "Swirl Drop", color: "from-indigo-500 to-purple-500" },
    { id: "rippleSpread", name: "Ripple Spread", color: "from-teal-500 to-cyan-500" },
    { id: "zoomRotate", name: "Zoom Rotate", color: "from-rose-500 to-pink-500" },
    { id: "foldUnfold", name: "Fold Unfold", color: "from-violet-500 to-fuchsia-500" },
    { id: "cascadeFlip", name: "Cascade Flip", color: "from-sky-500 to-blue-500" },
  ];

  // --- File upload ---
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageURL(ev.target.result);
        // reset animation state safely
        setAnimate(false);
        setIsAnimating(false);
        setAnimationKey((p) => p + 1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnimationSelect = (animId) => {
    if (isAnimating) return;
    setCurrentAnimation(animId);
    setAnimate(false);
    setIsAnimating(false);
  };

  const handlePlayAnimation = () => {
    if (!imageURL || isAnimating) return;
    setAnimate(false);
    setIsAnimating(false);
    setAnimationKey((p) => p + 1);
    // small timeout for DOM to settle
    setTimeout(() => {
      setIsAnimating(true);
      setAnimate(true);
    }, 120);
  };

  const handleReplay = () => {
    if (!imageURL || isAnimating) return;
    setAnimate(false);
    setIsAnimating(false);
    setTimeout(() => {
      setAnimationKey((p) => p + 1);
      setTimeout(() => {
        setIsAnimating(true);
        setAnimate(true);
      }, 80);
    }, 80);
  };

  // --- Build pieces with precomputed seeds (memoized) ---
  // Each piece will contain row, col, id and a small seed object used for animations.
  const pieces = useMemo(() => {
    if (!imageURL) return [];
    const tmp = [];
    // create consistent pseudo random per piece using a simple seeded function for repeatability
    const seededRnd = (seed) => {
      // small deterministic LCG
      let v = seed;
      return () => {
        v = (v * 1664525 + 1013904223) >>> 0;
        return (v % 1000) / 1000;
      };
    };

    let seedBase = 12345;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const id = row * GRID_SIZE + col;
        const rnd = seededRnd(seedBase + id);
        // precompute a few random-ish values
        const r1 = rnd(); // 0..1
        const r2 = rnd();
        const initialX = (r1 - 0.5) * 600; // reduced spread
        const initialY = (r2 - 0.5) * 600;
        const rotate = (rnd() - 0.5) * 720;
        const centerDist = Math.hypot(col - GRID_SIZE / 2, row - GRID_SIZE / 2);
        const delayRand = rnd() * 0.6;

        tmp.push({
          id,
          row,
          col,
          seed: { initialX, initialY, rotate, centerDist, delayRand },
        });
      }
    }
    return tmp;
  }, [imageURL, GRID_SIZE]);

  // Animation factory uses the precomputed seed values
  const getAnimationPropsForPiece = (piece) => {
    const s = piece.seed;
    const cfg = {
      pixelSpin: {
        initial: { x: s.initialX, y: s.initialY, rotate: s.rotate, opacity: 0, scale: 0.3 },
        animate: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
        transition: { duration: 2.2, delay: s.delayRand + (s.centerDist * 0.02), ease: [0.34, 1.26, 0.64, 1] },
      },
      waveCollapse: {
        initial: { y: -700, opacity: 0, scale: 0.25, rotate: -18 },
        animate: { y: 0, opacity: 1, scale: 1, rotate: 0 },
        transition: { duration: 2.0, delay: piece.col * 0.03 + piece.row * 0.03 + s.delayRand, ease: [0.43, 0.13, 0.23, 0.96] },
      },
      spiralZoom: {
        initial: { scale: 0, rotate: -360, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: { duration: 2.2, delay: s.centerDist * 0.04 + s.delayRand, ease: [0.34, 1.26, 0.64, 1] },
      },
      explosionGather: {
        initial: { x: (piece.col - GRID_SIZE / 2) * 50, y: (piece.row - GRID_SIZE / 2) * 50, scale: 0, opacity: 0, rotate: s.rotate * 0.5 },
        animate: { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 },
        transition: { duration: 2.6, delay: s.delayRand, ease: [0.34, 1.46, 0.64, 1] },
      },
      flipMosaic: {
        initial: { rotateY: 140, opacity: 0, scale: 0.7 },
        animate: { rotateY: 0, opacity: 1, scale: 1 },
        transition: { duration: 1.6, delay: (piece.row + piece.col) * 0.02 + s.delayRand, ease: [0.43, 0.13, 0.23, 0.96] },
      },
      swirlDrop: {
        initial: { x: (GRID_SIZE - piece.col) * 30 + (s.initialX * 0.2), y: -600 + (piece.row - GRID_SIZE / 2) * 8, rotate: s.rotate * 0.6, opacity: 0, scale: 0.5 },
        animate: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
        transition: { duration: 2.2, delay: (piece.row + (GRID_SIZE - piece.col)) * 0.018 + s.delayRand, ease: [0.22, 1, 0.36, 1] },
      },
      rippleSpread: {
        initial: { y: 50, scale: 0.65, opacity: 0, rotate: -8 },
        animate: { y: 0, scale: 1, opacity: 1, rotate: 0 },
        transition: { duration: 2.0, delay: s.centerDist * 0.03 + s.delayRand, ease: [0.34, 1.46, 0.64, 1] },
      },
      zoomRotate: {
        initial: { scale: 0.08, rotate: (s.rotate * 0.8), opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: { duration: 2.4, delay: (piece.row + piece.col) * 0.015 + s.delayRand, ease: [0.34, 1.26, 0.64, 1] },
      },
      foldUnfold: {
        initial: { scaleY: 0.12, opacity: 0, rotateX: 80 },
        animate: { scaleY: 1, opacity: 1, rotateX: 0 },
        transition: { duration: 1.8, delay: (piece.row + piece.col) * 0.02 + s.delayRand, ease: [0.43, 0.13, 0.23, 0.96] },
      },
      cascadeFlip: {
        initial: { rotateX: 100, opacity: 0, y: 30, scale: 0.85 },
        animate: { rotateX: 0, opacity: 1, y: 0, scale: 1 },
        transition: { duration: 1.9, delay: piece.col * 0.02 + (GRID_SIZE - piece.row) * 0.01 + s.delayRand, ease: [0.34, 1.26, 0.64, 1] },
      },
    };

    return cfg[currentAnimation] || cfg.explosionGather;
  };

  // --- Completion timer: compute max duration deterministically from piece seeds ---
  useEffect(() => {
    if (!animate || pieces.length === 0) {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
      return;
    }

    // Determine an upper bound for duration by scanning pieces once (cheap)
    let maxMs = 0;
    for (const p of pieces) {
      const ap = getAnimationPropsForPiece(p);
      const t = ap.transition || {};
      const dur = typeof t.duration === "number" ? t.duration : 0;
      const delay = typeof t.delay === "number" ? t.delay : 0;
      const total = Math.ceil((dur + delay) * 1000);
      if (total > maxMs) maxMs = total;
    }
    if (maxMs === 0) maxMs = 2500;

    completionTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, maxMs + 350);

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
    // intentionally depends on animate, pieces, currentAnimation, animationKey
  }, [animate, pieces, currentAnimation, animationKey]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  // --- Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            Image Deform Preview
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Upload an image and test animations</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </h2>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium">
                Choose Image
              </button>
              {imageURL && <p className="text-xs text-green-400 mt-2 text-center">✓ Image loaded</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Animation Style</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => handleAnimationSelect(anim.id)}
                    disabled={isAnimating}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 ${
                      currentAnimation === anim.id ? `bg-gradient-to-r ${anim.color} shadow-lg` : "bg-slate-700/50 hover:bg-slate-700"
                    }`}
                  >
                    {anim.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-slate-900/50 overflow-hidden rounded-xl shadow-2xl shadow-purple-900/50">
                {!imageURL && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">Upload an image to preview animations</p>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {imageURL && pieces.length > 0 && (
                    <div key={animationKey} style={{ position: "absolute", inset: 0 }}>
                      {pieces.map((piece) => {
                        const sizePercent = 100 / GRID_SIZE;
                        const pieceSizePx = 500 / GRID_SIZE; // matches backgroundSize below
                        const bgPosX = -(piece.col * pieceSizePx);
                        const bgPosY = -(piece.row * pieceSizePx);

                        const animProps = getAnimationPropsForPiece(piece);

                        return (
                          <motion.div
                            key={`${animationKey}-${piece.id}`}
                            initial={animProps.initial}
                            animate={animate ? animProps.animate : animProps.initial}
                            transition={animProps.transition}
                            style={{
                              position: "absolute",
                              width: `${sizePercent}%`,
                              height: `${sizePercent}%`,
                              left: `${(piece.col * 100) / GRID_SIZE}%`,
                              top: `${(piece.row * 100) / GRID_SIZE}%`,
                              backgroundImage: `url(${imageURL})`,
                              backgroundSize: `${500}px ${500}px`,
                              backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                              backgroundRepeat: "no-repeat",
                              transformOrigin: "center center",
                              // avoid will-change for all; use GPU-friendly transforms internally
                              pointerEvents: "none",
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 mt-6 justify-center">
                <button onClick={handlePlayAnimation} disabled={!imageURL || isAnimating} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium disabled:opacity-50">
                  <Play className="w-5 h-5" /> Play Animation
                </button>
                <button onClick={handleReplay} disabled={!imageURL || isAnimating} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium disabled:opacity-50">
                  <Repeat className="w-5 h-5" /> Replay
                </button>
              </div>

              {imageURL && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                  <p className="text-slate-400 text-sm">
                    Current Animation:{" "}
                    <span className="text-purple-400 font-semibold">{animations.find((a) => a.id === currentAnimation)?.name}</span>
                  </p>
                  {isAnimating && <p className="text-green-400 text-xs mt-1 animate-pulse">● Animating...</p>}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
