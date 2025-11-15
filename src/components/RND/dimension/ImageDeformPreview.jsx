import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Repeat } from "lucide-react";

export default function ImageDeformPreview() {
  const [imageURL, setImageURL] = useState(null);
  const [currentAnimation, setCurrentAnimation] = useState("pixelSpin");
  const [isAnimating, setIsAnimating] = useState(false);
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const fileInputRef = useRef(null);
  const completionTimerRef = useRef(null);

  const GRID_SIZE = 16; // Reduced from 20 to 16 for better performance

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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageURL(ev.target.result);
        setAnimate(false);
        setIsAnimating(false);
        setAnimationKey(prev => prev + 1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnimationSelect = (animId) => {
    setCurrentAnimation(animId);
    setAnimate(false);
    setIsAnimating(false);
  };

  const handlePlayAnimation = () => {
    if (!imageURL || isAnimating) return;
    
    setAnimate(false);
    setIsAnimating(false);
    setAnimationKey(prev => prev + 1);
    
    setTimeout(() => {
      setIsAnimating(true);
      setAnimate(true);
    }, 150);
  };

  const handleReplay = () => {
    if (!imageURL) return;
    
    setAnimate(false);
    setIsAnimating(false);
    
    setTimeout(() => {
      setAnimationKey(prev => prev + 1);
      setTimeout(() => {
        setIsAnimating(true);
        setAnimate(true);
      }, 100);
    }, 100);
  };

  // Populate pieces grid
  useEffect(() => {
    if (!imageURL) {
      setPieces([]);
      setImage(null);
      return;
    }
    setImage(imageURL);
    const temp = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        temp.push({ id: row * GRID_SIZE + col, row, col });
      }
    }
    setPieces(temp);
  }, [imageURL]);

  // Animation factory with improved, smoother, longer animations
  const getAnimationProps = (piece) => {
    const initialX = (Math.random() - 0.5) * 1000;
    const initialY = (Math.random() - 0.5) * 1000;
    const rotate = Math.random() * 720 - 360;

    const centerDist = Math.sqrt(
      Math.pow(piece.col - GRID_SIZE / 2, 2) + Math.pow(piece.row - GRID_SIZE / 2, 2)
    );

    const animationConfigs = {
      pixelSpin: {
        initial: { x: initialX, y: initialY, rotate, opacity: 0, scale: 0.3 },
        animate: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
        transition: { 
          duration: 2.8, 
          delay: Math.random() * 2, 
          ease: [0.34, 1.26, 0.64, 1],
          opacity: { duration: 2.5 }
        },
      },
      waveCollapse: {
        initial: { y: -1000, opacity: 0, scale: 0.2, rotate: -20 },
        animate: { y: 0, opacity: 1, scale: 1, rotate: 0 },
        transition: {
          duration: 2.5,
          delay: piece.col * 0.035 + piece.row * 0.035,
          ease: [0.43, 0.13, 0.23, 0.96],
        },
      },
      spiralZoom: {
        initial: { scale: 0, rotate: -360, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: {
          duration: 2.8,
          delay: centerDist * 0.05,
          ease: [0.34, 1.26, 0.64, 1],
        },
      },
      explosionGather: {
        initial: {
          x: (piece.col - GRID_SIZE / 2) * 80,
          y: (piece.row - GRID_SIZE / 2) * 80,
          scale: 0,
          opacity: 0,
          rotate: (Math.random() - 0.5) * 180,
        },
        animate: { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 },
        transition: { 
          duration: 3, 
          delay: Math.random() * 1.2, 
          ease: [0.34, 1.46, 0.64, 1],
          opacity: { duration: 2.5 }
        },
      },
      flipMosaic: {
        initial: { rotateY: 180, opacity: 0, scale: 0.6 },
        animate: { rotateY: 0, opacity: 1, scale: 1 },
        transition: { 
          duration: 2, 
          delay: (piece.row + piece.col) * 0.04, 
          ease: [0.43, 0.13, 0.23, 0.96] 
        },
      },
      swirlDrop: {
        initial: {
          x: (GRID_SIZE - piece.col) * 60 + (Math.random() - 0.5) * 100,
          y: -800 + (piece.row - GRID_SIZE / 2) * 10,
          rotate: (Math.random() - 0.5) * 540,
          opacity: 0,
          scale: 0.4,
        },
        animate: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
        transition: {
          duration: 2.6,
          delay: (piece.row + (GRID_SIZE - piece.col)) * 0.028 + Math.random() * 0.4,
          ease: [0.22, 1, 0.36, 1],
        },
      },
      rippleSpread: {
        initial: { y: 60, scale: 0.5, opacity: 0, rotate: -10 },
        animate: { y: 0, scale: 1, opacity: 1, rotate: 0 },
        transition: { 
          duration: 2.4, 
          delay: centerDist * 0.06, 
          ease: [0.34, 1.46, 0.64, 1] 
        },
      },
      zoomRotate: {
        initial: { scale: 0.05, rotate: (Math.random() - 0.5) * 900, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: {
          duration: 2.8,
          delay: (piece.row + piece.col) * 0.02 + Math.random() * 0.3,
          ease: [0.34, 1.26, 0.64, 1],
        },
      },
      foldUnfold: {
        initial: { scaleY: 0.1, opacity: 0, rotateX: 90 },
        animate: { scaleY: 1, opacity: 1, rotateX: 0 },
        transition: { 
          duration: 2, 
          delay: (piece.row + piece.col) * 0.03, 
          ease: [0.43, 0.13, 0.23, 0.96] 
        },
      },
      cascadeFlip: {
        initial: { rotateX: 120, opacity: 0, y: 50, scale: 0.8 },
        animate: { rotateX: 0, opacity: 1, y: 0, scale: 1 },
        transition: {
          duration: 2.2,
          delay: piece.col * 0.03 + (GRID_SIZE - piece.row) * 0.015,
          ease: [0.34, 1.26, 0.64, 1],
        },
      },
    };

    return animationConfigs[currentAnimation] || animationConfigs.explosionGather;
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  // Animation completion timer
  useEffect(() => {
    if (!animate || pieces.length === 0) {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
      return;
    }

    let maxSec = 0;
    for (const p of pieces) {
      const ap = getAnimationProps(p);
      const t = ap.transition || {};
      const dur = typeof t.duration === "number" ? t.duration : 0;
      const delay = typeof t.delay === "number" ? t.delay : 0;
      const total = dur + delay;
      if (total > maxSec) maxSec = total;
    }
    if (maxSec === 0) maxSec = 3;

    completionTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, Math.ceil(maxSec * 1000) + 500);

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
    };
  }, [animate, pieces, currentAnimation, animationKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            Image Deform Preview
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Upload an image and test all 10 animation styles
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Choose Image
              </button>
              {imageURL && (
                <p className="text-xs text-green-400 mt-2 text-center">✓ Image loaded</p>
              )}
            </motion.div>

            {/* Animation Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Animation Style</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => handleAnimationSelect(anim.id)}
                    disabled={isAnimating}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 ${
                      currentAnimation === anim.id
                        ? `bg-gradient-to-r ${anim.color} shadow-lg`
                        : "bg-slate-700/50 hover:bg-slate-700"
                    }`}
                  >
                    {anim.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            >
              {/* Image Display Area */}
              <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-slate-900/50 overflow-hidden rounded-xl shadow-2xl shadow-purple-900/50">
                {!image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">Upload an image to preview animations</p>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {image && pieces.length > 0 && (
                    <div key={animationKey}>
                      {pieces.map((piece) => {
                        const size = 500 / GRID_SIZE;
                        const backgroundPosition = `-${piece.col * size}px -${piece.row * size}px`;
                        const animProps = getAnimationProps(piece);

                        return (
                          <motion.div
                            key={`${animationKey}-${piece.id}`}
                            initial={animProps.initial}
                            animate={animate ? animProps.animate : animProps.initial}
                            transition={animProps.transition}
                            className="absolute will-change-transform"
                            style={{
                              width: `${100 / GRID_SIZE}%`,
                              height: `${100 / GRID_SIZE}%`,
                              left: `${(piece.col * 100) / GRID_SIZE}%`,
                              top: `${(piece.row * 100) / GRID_SIZE}%`,
                              backgroundImage: `url(${image})`,
                              backgroundSize: "500px 500px",
                              backgroundPosition,
                              backgroundRepeat: "no-repeat",
                              transformOrigin: "center center",
                              backfaceVisibility: "hidden",
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={handlePlayAnimation}
                  disabled={!imageURL || isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Play className="w-5 h-5" />
                  Play Animation
                </button>
                <button
                  onClick={handleReplay}
                  disabled={!imageURL || isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Repeat className="w-5 h-5" />
                  Replay
                </button>
              </div>

              {/* Current Animation Info */}
              {imageURL && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-center"
                >
                  <p className="text-slate-400 text-sm">
                    Current Animation:{" "}
                    <span className="text-purple-400 font-semibold">
                      {animations.find((a) => a.id === currentAnimation)?.name}
                    </span>
                  </p>
                  {isAnimating && (
                    <p className="text-green-400 text-xs mt-1 animate-pulse">● Animating...</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}