import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, RefreshCw } from "lucide-react";
import MosaicBG from "../assets/img/dummyBg.png";

// ============================================
// ANIMATION DEFINITIONS - Add more here!
// ============================================

const ANIMATIONS = {
  // Original smooth animation
  smoothCover: {
    name: "Smooth Cover",
    config: {
      initialDelay: 0.3,
      coverDuration: 0.6,
      coverHoldDuration: 0.5,
      shrinkDuration: 1.2,
      revealDuration: 0.6,
      particleDuration: 0.8,
    },
    phases: {
      initial: {
        width: "0%",
        height: "0%",
        x: 0,
        y: 0,
        scale: 0.8,
        rotate: 0,
      },
      cover: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
        },
        transition: {
          duration: config.coverDuration,
          ease: [0.22, 1, 0.36, 1],
        },
      }),
      hold: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: [1, 1.02, 1],
          rotate: 0,
        },
        transition: {
          duration: config.coverHoldDuration,
          scale: {
            duration: config.coverHoldDuration,
            ease: "easeInOut",
          },
        },
      }),
      shrink: (config, targetPos) => ({
        animate: {
          width: targetPos.width,
          height: targetPos.height,
          x: targetPos.x,
          y: targetPos.y,
          scale: 1,
          rotate: 720,
        },
        transition: {
          duration: config.shrinkDuration,
          ease: [0.65, 0, 0.35, 1],
          rotate: {
            duration: config.shrinkDuration,
            ease: [0.65, 0, 0.35, 1],
          },
        },
      }),
    },
    effects: {
      flash: (phase, config) =>
        phase === "cover" && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{
              duration: config.coverDuration,
              times: [0, 0.5, 1],
              ease: "easeInOut",
            }}
          />
        ),
      glow: (phase, config) => ({
        initial: { opacity: 0 },
        animate:
          phase === "cover"
            ? {
                boxShadow:
                  "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
              }
            : phase === "hold"
            ? {
                boxShadow: [
                  "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                  "0 0 100px 40px rgba(168,85,247,1), inset 0 0 80px rgba(255,255,255,0.5)",
                  "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                ],
              }
            : {
                boxShadow:
                  "0 0 40px 15px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
              },
        transition:
          phase === "hold"
            ? { duration: config.coverHoldDuration, ease: "easeInOut" }
            : { duration: 0.5 },
      }),
    },
  },

  // New deformed animation
  deformedEntry: {
    name: "Deformed Entry",
    config: {
      initialDelay: 0.2,
      coverDuration: 0.8,
      coverHoldDuration: 0.6,
      shrinkDuration: 1.0,
      revealDuration: 0.6,
      particleDuration: 0.8,
    },
    phases: {
      initial: {
        width: "0%",
        height: "0%",
        x: 0,
        y: 0,
        scale: 0,
        rotate: 0,
        scaleX: 0.3,
        scaleY: 0.3,
      },
      cover: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: 1,
          scaleX: [0.3, 1.8, 0.6, 1.2, 1],
          scaleY: [0.3, 0.6, 1.5, 0.8, 1],
          rotate: [0, -15, 15, -8, 0],
        },
        transition: {
          duration: config.coverDuration,
          ease: [0.34, 1.56, 0.64, 1],
          scaleX: {
            duration: config.coverDuration,
            times: [0, 0.3, 0.5, 0.7, 1],
            ease: "easeInOut",
          },
          scaleY: {
            duration: config.coverDuration,
            times: [0, 0.3, 0.5, 0.7, 1],
            ease: "easeInOut",
          },
          rotate: {
            duration: config.coverDuration,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
          },
        },
      }),
      hold: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: 1,
          scaleX: [1, 1.05, 0.95, 1],
          scaleY: [1, 0.95, 1.05, 1],
          rotate: [0, 3, -3, 0],
        },
        transition: {
          duration: config.coverHoldDuration,
          ease: "easeInOut",
          repeat: 0,
        },
      }),
      shrink: (config, targetPos) => ({
        animate: {
          width: targetPos.width,
          height: targetPos.height,
          x: targetPos.x,
          y: targetPos.y,
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          rotate: 360,
        },
        transition: {
          duration: config.shrinkDuration,
          ease: [0.45, 0, 0.55, 1],
          rotate: {
            duration: config.shrinkDuration,
            ease: "easeInOut",
          },
        },
      }),
    },
    effects: {
      flash: (phase, config) =>
        phase === "cover" && (
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
            transition={{
              duration: config.coverDuration,
              times: [0, 0.4, 1],
              ease: "easeOut",
            }}
          />
        ),
      glow: (phase, config) => ({
        initial: { opacity: 0 },
        animate:
          phase === "cover"
            ? {
                boxShadow: [
                  "0 0 0px 0px rgba(168,85,247,0)",
                  "0 0 60px 20px rgba(236,72,153,0.8), inset 0 0 40px rgba(255,255,255,0.3)",
                  "0 0 100px 40px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                ],
              }
            : phase === "hold"
            ? {
                boxShadow: [
                  "0 0 100px 40px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                  "0 0 120px 50px rgba(236,72,153,1), inset 0 0 80px rgba(255,255,255,0.5)",
                  "0 0 100px 40px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                ],
              }
            : {
                boxShadow:
                  "0 0 40px 15px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
              },
        transition:
          phase === "cover"
            ? {
                duration: config.coverDuration,
                times: [0, 0.5, 1],
                ease: "easeInOut",
              }
            : phase === "hold"
            ? { duration: config.coverHoldDuration, ease: "easeInOut" }
            : { duration: 0.5 },
      }),
    },
  },

  // Spiral animation
  spiralZoom: {
    name: "Spiral Zoom",
    config: {
      initialDelay: 0.2,
      coverDuration: 0.9,
      coverHoldDuration: 0.4,
      shrinkDuration: 1.1,
      revealDuration: 0.6,
      particleDuration: 0.8,
    },
    phases: {
      initial: {
        width: "10%",
        height: "10%",
        x: 0,
        y: 0,
        scale: 0,
        rotate: -180,
      },
      cover: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
        },
        transition: {
          duration: config.coverDuration,
          ease: [0.16, 1, 0.3, 1],
          rotate: {
            duration: config.coverDuration,
            ease: "easeOut",
          },
        },
      }),
      hold: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: [1, 1.03, 1],
          rotate: [0, 5, 0],
        },
        transition: {
          duration: config.coverHoldDuration,
          ease: "easeInOut",
        },
      }),
      shrink: (config, targetPos) => ({
        animate: {
          width: targetPos.width,
          height: targetPos.height,
          x: targetPos.x,
          y: targetPos.y,
          scale: 1,
          rotate: 1080, // Three full rotations
        },
        transition: {
          duration: config.shrinkDuration,
          ease: [0.6, 0.01, 0.05, 0.95],
          rotate: {
            duration: config.shrinkDuration,
            ease: "easeInOut",
          },
        },
      }),
    },
    effects: {
      flash: (phase, config) =>
        phase === "cover" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: [0, 0.7, 0], rotate: 0 }}
            transition={{
              duration: config.coverDuration,
              times: [0, 0.3, 1],
              ease: "easeOut",
            }}
          />
        ),
      glow: (phase, config) => ({
        initial: { opacity: 0 },
        animate:
          phase === "cover"
            ? {
                boxShadow:
                  "0 0 100px 40px rgba(168,85,247,1), inset 0 0 80px rgba(255,255,255,0.5)",
              }
            : phase === "hold"
            ? {
                boxShadow: [
                  "0 0 100px 40px rgba(168,85,247,1), inset 0 0 80px rgba(255,255,255,0.5)",
                  "0 0 120px 50px rgba(59,130,246,1), inset 0 0 100px rgba(255,255,255,0.6)",
                  "0 0 100px 40px rgba(168,85,247,1), inset 0 0 80px rgba(255,255,255,0.5)",
                ],
              }
            : {
                boxShadow:
                  "0 0 40px 15px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
              },
        transition:
          phase === "hold"
            ? { duration: config.coverHoldDuration, ease: "easeInOut" }
            : { duration: 0.5 },
      }),
    },
  },

  // Vortex Dissolve animation
  vortexDissolve: {
    name: "Vortex Dissolve",
    config: {
      initialDelay: 0.1,
      coverDuration: 1.2,
      coverHoldDuration: 0.4,
      shrinkDuration: 1.0,
      revealDuration: 0.6,
      particleDuration: 0.8,
    },
    phases: {
      initial: {
        width: "20%",
        height: "20%",
        x: 0,
        y: 0,
        scale: 0,
        rotate: 0,
        opacity: 0,
      },
      cover: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: 1,
          rotate: 1080,
          opacity: 1,
        },
        transition: {
          duration: config.coverDuration,
          ease: [0.25, 0.46, 0.45, 0.94],
          rotate: {
            duration: config.coverDuration,
            ease: "linear",
          },
        },
      }),
      hold: (config) => ({
        animate: {
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          scale: [1, 1.02, 1],
          rotate: 1080,
          opacity: 1,
        },
        transition: {
          duration: config.coverHoldDuration,
          ease: "easeInOut",
        },
      }),
      shrink: (config, targetPos) => ({
        animate: {
          width: targetPos.width,
          height: targetPos.height,
          x: targetPos.x,
          y: targetPos.y,
          scale: 1,
          rotate: 1800,
          opacity: 1,
        },
        transition: {
          duration: config.shrinkDuration,
          ease: [0.45, 0, 0.55, 1],
          rotate: {
            duration: config.shrinkDuration,
            ease: "easeInOut",
          },
        },
      }),
    },
    effects: {
      flash: (phase, config) =>
        phase === "cover" && (
          <>
            {/* Multiple vortex spiral arms */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`vortex-arm-${i}`}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from ${i * 30}deg, transparent 0%, rgba(168,85,247,${0.7 - i * 0.05}) 20%, transparent 40%)`,
                  mixBlendMode: "screen",
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  rotate: i * 30 
                }}
                animate={{ 
                  opacity: [0, 1, 0.5, 0],
                  scale: [0, 1.5, 2, 3],
                  rotate: i * 30 + 1080
                }}
                transition={{
                  duration: config.coverDuration,
                  times: [0, 0.3, 0.6, 1],
                  ease: "easeOut",
                  delay: i * 0.03,
                }}
              />
            ))}

            {/* Dissolve particle bursts */}
            {[...Array(40)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 40;
              const distance = 30 + (i % 3) * 20;
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${4 + (i % 3) * 2}px`,
                    height: `${4 + (i % 3) * 2}px`,
                    left: "50%",
                    top: "50%",
                    marginLeft: `-${2 + (i % 3)}px`,
                    marginTop: `-${2 + (i % 3)}px`,
                    background: i % 2 === 0 
                      ? "rgba(168,85,247,0.9)" 
                      : "rgba(236,72,153,0.9)",
                    boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.cos(angle + (i * 0.1)) * distance,
                    y: Math.sin(angle + (i * 0.1)) * distance,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.5, 1, 0],
                  }}
                  transition={{
                    duration: config.coverDuration * 0.8,
                    times: [0, 0.2, 0.6, 1],
                    ease: "easeOut",
                    delay: i * 0.015,
                  }}
                />
              );
            })}

            {/* Central vortex core */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(168,85,247,0.6) 20%, rgba(236,72,153,0.4) 40%, transparent 70%)",
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 0.7, 0], 
                scale: [0, 0.5, 1.5, 2.5],
                rotate: 720
              }}
              transition={{
                duration: config.coverDuration,
                times: [0, 0.3, 0.6, 1],
                ease: "easeOut",
              }}
            />

            {/* Outer ring pulse */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute inset-0 rounded-full border-4"
                style={{
                  borderColor: i % 2 === 0 ? "rgba(168,85,247,0.6)" : "rgba(236,72,153,0.6)",
                  boxShadow: "0 0 20px rgba(168,85,247,0.8)",
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0.3,
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0.3, 1.2, 2],
                }}
                transition={{
                  duration: config.coverDuration * 0.7,
                  times: [0, 0.4, 1],
                  ease: "easeOut",
                  delay: i * 0.15,
                }}
              />
            ))}
          </>
        ),
      glow: (phase, config) => ({
        initial: { opacity: 0 },
        animate:
          phase === "cover"
            ? {
                boxShadow: [
                  "0 0 0px 0px rgba(168,85,247,0)",
                  "0 0 100px 40px rgba(168,85,247,0.9), inset 0 0 80px rgba(255,255,255,0.4)",
                  "0 0 150px 60px rgba(236,72,153,1), inset 0 0 100px rgba(255,255,255,0.6)",
                ],
                filter: ["blur(0px)", "blur(3px)", "blur(0px)"],
              }
            : phase === "hold"
            ? {
                boxShadow:
                  "0 0 150px 60px rgba(236,72,153,1), inset 0 0 100px rgba(255,255,255,0.6)",
                filter: "blur(0px)",
              }
            : {
                boxShadow:
                  "0 0 40px 15px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
                filter: "blur(0px)",
              },
        transition:
          phase === "cover"
            ? {
                duration: config.coverDuration,
                times: [0, 0.5, 1],
                ease: "easeInOut",
              }
            : phase === "hold"
            ? { duration: config.coverHoldDuration, ease: "easeInOut" }
            : { duration: 0.5 },
      }),
    },
  },
};

// ============================================
// CUSTOM HOOK - Manages animation lifecycle
// ============================================

function useImageAnimation(animationKey = "vortexDissolve") {
  const [animatingImage, setAnimatingImage] = useState(null);
  const [targetTileIndex, setTargetTileIndex] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null);

  const animation = ANIMATIONS[animationKey];
  const config = animation.config;

  const totalAnimationTime =
    config.initialDelay +
    config.coverDuration +
    config.coverHoldDuration +
    config.shrinkDuration +
    config.revealDuration;

  const startAnimation = (dataUrl, tileIndex, onComplete) => {
    setAnimatingImage(dataUrl);
    setTargetTileIndex(tileIndex);

    // Phase 1: Initial delay
    setTimeout(() => {
      setAnimationPhase("cover");
    }, config.initialDelay * 1000);

    // Phase 2: Hold at full size
    setTimeout(() => {
      setAnimationPhase("hold");
    }, (config.initialDelay + config.coverDuration) * 1000);

    // Phase 3: Shrink and move
    setTimeout(() => {
      setAnimationPhase("shrink");
    }, (config.initialDelay + config.coverDuration + config.coverHoldDuration) * 1000);

    // Phase 4: Reveal tile
    setTimeout(() => {
      setAnimationPhase("reveal");
      if (onComplete) onComplete();
    }, (config.initialDelay + config.coverDuration + config.coverHoldDuration + config.shrinkDuration) * 1000);

    // Phase 5: Complete and cleanup
    setTimeout(() => {
      setAnimatingImage(null);
      setTargetTileIndex(null);
      setAnimationPhase(null);
    }, totalAnimationTime * 1000);
  };

  const reset = () => {
    setAnimatingImage(null);
    setTargetTileIndex(null);
    setAnimationPhase(null);
  };

  return {
    animatingImage,
    targetTileIndex,
    animationPhase,
    startAnimation,
    reset,
    isAnimating: animatingImage !== null,
    totalAnimationTime,
    animation,
    config,
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MosaicWallAll() {
  const gridSize = 6;
  const totalTiles = gridSize * gridSize;

  // Select animation style here!
  const CURRENT_ANIMATION = "smoothCover"; // Try: "smoothCover", "deformedEntry", "spiralZoom" , "vortexDissolve"

  const [tiles, setTiles] = useState(() => Array(totalTiles).fill(null));
  const [lastRevealedIndex, setLastRevealedIndex] = useState(null);

  const {
    animatingImage,
    targetTileIndex,
    animationPhase,
    startAnimation,
    reset: resetAnimation,
    isAnimating,
    totalAnimationTime,
    animation,
    config,
  } = useImageAnimation(CURRENT_ANIMATION);

  const filledCount = useMemo(
    () => tiles.reduce((acc, t) => acc + (t ? 1 : 0), 0),
    [tiles]
  );
  const isFull = filledCount === totalTiles;

  const revealOneRandomTile = (dataUrl) => {
    const empty = [];
    for (let i = 0; i < tiles.length; i++) if (!tiles[i]) empty.push(i);
    if (!empty.length) return;

    const pick = empty[Math.floor(Math.random() * empty.length)];

    startAnimation(dataUrl, pick, () => {
      const next = tiles.slice();
      next[pick] = dataUrl;
      setTiles(next);
      setLastRevealedIndex(pick);

      setTimeout(() => setLastRevealedIndex(null), 1000);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      revealOneRandomTile(reader.result);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setTiles(Array(totalTiles).fill(null));
    setLastRevealedIndex(null);
    resetAnimation();
  };

  const getTilePosition = (index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      width: `${100 / gridSize}%`,
      height: `${100 / gridSize}%`,
      x: `${(col - gridSize / 2 + 0.5) * 100}%`,
      y: `${(row - gridSize / 2 + 0.5) * 100}%`,
    };
  };

  const getPhaseAnimation = () => {
    if (!animationPhase || !animation.phases[animationPhase]) return {};

    const targetPos =
      targetTileIndex !== null ? getTilePosition(targetTileIndex) : null;
    const phaseConfig = animation.phases[animationPhase];

    if (typeof phaseConfig === "function") {
      return phaseConfig(config, targetPos);
    }
    return phaseConfig;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Mosaic Wall Revealer
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <label
              className={`relative cursor-pointer group ${
                isFull || isAnimating ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <motion.div
                whileHover={{ scale: isFull || isAnimating ? 1 : 1.05 }}
                whileTap={{ scale: isFull || isAnimating ? 1 : 0.95 }}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                <Upload className="w-5 h-5" />
                <span>
                  {isFull
                    ? "Wall Complete"
                    : isAnimating
                    ? "Animating..."
                    : "Upload to fill 1 tile"}
                </span>
              </motion.div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isFull || isAnimating}
              />
            </label>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reset Wall</span>
            </motion.button>
          </div>

          <p className="text-center mt-4 text-purple-200 font-medium">
            {filledCount} / {totalTiles} tiles filled
            {isFull
              ? " — 🎉 all done!"
              : " — upload again to reveal the next tile"}
          </p>

          {animationPhase && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-2 text-purple-300 text-sm"
            >
              Phase:{" "}
              {animationPhase === "cover"
                ? "📸 Capturing..."
                : animationPhase === "hold"
                ? "⏸️ Processing..."
                : animationPhase === "shrink"
                ? "🎯 Finding spot..."
                : "✨ Revealing!"}
            </motion.p>
          )}

          <p className="text-center mt-2 text-purple-300 text-xs">
            Animation: <span className="font-semibold">{animation.name}</span>{" "}
            (~
            {totalAnimationTime.toFixed(1)}s)
          </p>
        </motion.div>

        {/* Mosaic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-4xl mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={MosaicBG}
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Animating Image Overlay */}
          <AnimatePresence>
            {animatingImage && targetTileIndex !== null && (
              <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Flash/Background effect */}
                {animation.effects.flash(animationPhase, config)}

                {/* Animating image */}
                <motion.div
                  className="absolute overflow-hidden"
                  style={{
                    borderRadius:
                      animationPhase === "shrink" || animationPhase === "reveal"
                        ? "0.75rem"
                        : "1rem",
                  }}
                  initial={animation.phases.initial}
                  animate={getPhaseAnimation().animate}
                  transition={getPhaseAnimation().transition}
                >
                  <img
                    src={animatingImage}
                    alt="Animating"
                    className="w-full h-full object-cover"
                  />

                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    {...animation.effects.glow(animationPhase, config)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tiles */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {tiles.map((src, index) => {
              const isRevealed = Boolean(src);
              const isLatest = lastRevealedIndex === index;

              return (
                <motion.div
                  key={index}
                  className="relative overflow-hidden"
                  initial={false}
                  animate={{
                    backgroundColor: isRevealed ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.99)",
                  }}
                >
                  {isRevealed && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        duration: config.revealDuration,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <img
                        src={src}
                        alt={`Tile ${index}`}
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                          opacity: 0.4,
                        }}
                      />
                      {isLatest && (
                        <>
                          {/* Expanding ring effect */}
                          <motion.div
                            className="absolute inset-0"
                            initial={{
                              opacity: 1,
                              scale: 0.8,
                            }}
                            animate={{
                              opacity: 0,
                              scale: 1.5,
                            }}
                            transition={{
                              duration: config.particleDuration,
                              ease: "easeOut",
                            }}
                            style={{
                              boxShadow:
                                "inset 0 0 0 4px rgba(255,255,255,0.8), 0 0 40px rgba(168,85,247,1)",
                            }}
                          />

                          {/* Inner glow */}
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{
                              duration: config.particleDuration * 1.2,
                              ease: "easeOut",
                            }}
                            style={{
                              background:
                                "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
                            }}
                          />

                          {/* Particle burst effect */}
                          {[...Array(12)].map((_, i) => {
                            const angle = (i * Math.PI * 2) / 12;
                            return (
                              <motion.div
                                key={i}
                                className="absolute w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                                style={{
                                  left: "50%",
                                  top: "50%",
                                  marginLeft: "-6px",
                                  marginTop: "-6px",
                                }}
                                initial={{
                                  x: 0,
                                  y: 0,
                                  opacity: 1,
                                  scale: 1,
                                }}
                                animate={{
                                  x: Math.cos(angle) * 80,
                                  y: Math.sin(angle) * 80,
                                  opacity: 0,
                                  scale: 0,
                                }}
                                transition={{
                                  duration: config.particleDuration,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              />
                            );
                          })}
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Grid Lines */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {Array.from({ length: totalTiles }).map((_, i) => (
              <div key={`grid-${i}`} className="border border-white/5" />
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8 text-gray-300"
        >
          <p className="text-sm">
            Upload an image to see the <strong>{animation.name}</strong>{" "}
            animation!
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Change{" "}
            <code className="bg-gray-800 px-2 py-1 rounded">
              CURRENT_ANIMATION
            </code>{" "}
            to try: "smoothCover", "deformedEntry", or "spiralZoom"
          </p>
        </motion.div>
      </div>
    </div>
  );
}
