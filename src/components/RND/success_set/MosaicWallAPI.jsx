import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import MosaicBG from "../../../assets/img/dummyBg.png";

export default function MosaicWallAPI({
  imageURL,
  onReset,
  tiles: propTiles,
  setTiles: setPropTiles,
  gridSize = 6,
  onRevealComplete = null, // NEW
}) {
  const totalTiles = gridSize * gridSize;

  // Animation timing configuration (in seconds)
  const ANIMATION_CONFIG = {
    initialDelay: 0.3, // Wait before starting
    coverDuration: 0.6, // Time to cover the wall
    coverHoldDuration: 0.5, // Hold at full size
    shrinkDuration: 1.2, // Time to shrink and move to tile
    revealDuration: 0.6, // Tile reveal animation
    particleDuration: 0.8, // Particle burst duration
  };

  const totalAnimationTime =
    ANIMATION_CONFIG.initialDelay +
    ANIMATION_CONFIG.coverDuration +
    ANIMATION_CONFIG.coverHoldDuration +
    ANIMATION_CONFIG.shrinkDuration +
    ANIMATION_CONFIG.revealDuration;

  // Use lifted tiles if provided, otherwise internal fallback (backwards compatibility)
  const [internalTiles, setInternalTiles] = useState(() =>
    Array(totalTiles).fill(null)
  );
  const tiles = propTiles ?? internalTiles;
  const setTiles = setPropTiles ?? setInternalTiles;

  const [lastRevealedIndex, setLastRevealedIndex] = useState(null);
  const [animatingImage, setAnimatingImage] = useState(null);
  const [targetTileIndex, setTargetTileIndex] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null);
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

    setAnimatingImage(dataUrl);
    setTargetTileIndex(pick);

    setTimeout(
      () => setAnimationPhase("cover"),
      ANIMATION_CONFIG.initialDelay * 1000
    );
    setTimeout(
      () => setAnimationPhase("hold"),
      (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration) * 1000
    );
    setTimeout(
      () => setAnimationPhase("shrink"),
      (ANIMATION_CONFIG.initialDelay +
        ANIMATION_CONFIG.coverDuration +
        ANIMATION_CONFIG.coverHoldDuration) *
        1000
    );

    setTimeout(() => {
      setAnimationPhase("reveal");
      const next = tiles.slice();
      next[pick] = dataUrl;
      setTiles(next);
      setLastRevealedIndex(pick);
    }, (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration + ANIMATION_CONFIG.coverHoldDuration + ANIMATION_CONFIG.shrinkDuration) * 1000);

    // cleanup after total run
    setTimeout(() => {
      setAnimatingImage(null);
      setTargetTileIndex(null);
      setAnimationPhase(null);
      setTimeout(() => setLastRevealedIndex(null), 1000);

      // NEW: notify parent that this reveal run has fully finished so it can process next queued image
      try {
        if (typeof onRevealComplete === "function") {
          onRevealComplete();
        }
      } catch (err) {
        console.error("onRevealComplete threw:", err);
      }
    }, totalAnimationTime * 1000);
  };

  // When imageURL prop changes -> reveal one random tile (unless wall is full)
  useEffect(() => {
    if (imageURL && !isFull) {
      revealOneRandomTile(imageURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageURL]);

   useEffect(() => {
    console.log("MosaicWall: imageURL changed →", imageURL);
    if (!imageURL) return;

    // Start the reveal cycle for this imageURL
    let cancelled = false;
    (async () => {
      console.log("MosaicWall: starting reveal for", imageURL);
      try {
        // If you have a function that reveals a tile and returns when done:
        // await revealOneRandomTile(imageURL);
        // Example if your reveal is callback-based:
        await new Promise((resolve) => {
          // call your existing reveal function and resolve when finished
          revealOneRandomTile(imageURL, () => resolve());
        });
        if (cancelled) {
          console.log("MosaicWall: reveal cancelled for", imageURL);
          return;
        }
        console.log("MosaicWall: reveal finished for", imageURL);
      } catch (err) {
        console.error("MosaicWall: reveal threw", err);
      } finally {
        // Always call parent callback (defensive)
        try {
          if (typeof onRevealComplete === "function") {
            onRevealComplete();
          } else {
            console.warn("MosaicWall: no onRevealComplete prop");
          }
        } catch (err) {
          console.error("MosaicWall: onRevealComplete threw", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      // If you use setTimeout internally, clear them here (store ids in refs)
    };
  }, [imageURL, onRevealComplete]);

  const getTilePosition = (index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      x: (col - gridSize / 2 + 0.5) * 100,
      y: (row - gridSize / 2 + 0.5) * 100,
    };
  };

  // Reset handler: if parent provided onReset, call it (parent may clear tiles)
  const handleReset = () => {
    // Clear local tiles if using internal state
    if (!propTiles) {
      setTiles(Array(totalTiles).fill(null));
    } else {
      // if parent manages tiles, call its onReset (parent should clear tiles)
      if (onReset) onReset();
    }
    setLastRevealedIndex(null);
    setAnimatingImage(null);
    setTargetTileIndex(null);
    setAnimationPhase(null);
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
        </motion.div>

        {/* Mosaic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-7xl mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl"
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
                {/* Full screen flash effect - only at the start */}
                {animationPhase === "cover" && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{
                      duration: ANIMATION_CONFIG.coverDuration,
                      times: [0, 0.5, 1],
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Animating image */}
                <motion.div
                  className="absolute overflow-hidden"
                  style={{
                    borderRadius:
                      animationPhase === "shrink" || animationPhase === "reveal"
                        ? "0.75rem"
                        : "1rem",
                  }}
                  initial={{
                    width: "0%",
                    height: "0%",
                    x: 0,
                    y: 0,
                    scale: 0.8,
                    rotate: 0,
                  }}
                  animate={
                    animationPhase === "cover"
                      ? {
                          // Phase 1: Grow to cover entire wall
                          width: "100%",
                          height: "100%",
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                        }
                      : animationPhase === "hold"
                      ? {
                          // Phase 2: Hold at full size with subtle pulse
                          width: "100%",
                          height: "100%",
                          x: 0,
                          y: 0,
                          scale: [1, 1.02, 1],
                          rotate: 0,
                        }
                      : animationPhase === "shrink" ||
                        animationPhase === "reveal"
                      ? {
                          // Phase 3: Shrink and move to target tile
                          width: `${100 / gridSize}%`,
                          height: `${100 / gridSize}%`,
                          x: `${getTilePosition(targetTileIndex).x}%`,
                          y: `${getTilePosition(targetTileIndex).y}%`,
                          scale: 1,
                          rotate: 720, // Two full rotations
                        }
                      : {}
                  }
                  transition={
                    animationPhase === "cover"
                      ? {
                          duration: ANIMATION_CONFIG.coverDuration,
                          ease: [0.22, 1, 0.36, 1], // Smooth ease out
                        }
                      : animationPhase === "hold"
                      ? {
                          duration: ANIMATION_CONFIG.coverHoldDuration,
                          scale: {
                            duration: ANIMATION_CONFIG.coverHoldDuration,
                            repeat: 0,
                            ease: "easeInOut",
                          },
                        }
                      : animationPhase === "shrink" ||
                        animationPhase === "reveal"
                      ? {
                          duration: ANIMATION_CONFIG.shrinkDuration,
                          ease: [0.65, 0, 0.35, 1], // Smooth ease in-out
                          rotate: {
                            duration: ANIMATION_CONFIG.shrinkDuration,
                            ease: [0.65, 0, 0.35, 1],
                          },
                        }
                      : {}
                  }
                >
                  <img
                    src={animatingImage}
                    alt="Animating"
                    className="w-full h-full object-cover"
                  />

                  {/* Glow effect during animation */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={
                      animationPhase === "cover"
                        ? {
                            boxShadow:
                              "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                          }
                        : animationPhase === "hold"
                        ? {
                            boxShadow: [
                              "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                              "0 0 100px 40px rgba(168,85,247,1), inset 0 0 80px rgba(255,255,255,0.5)",
                              "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                            ],
                          }
                        : animationPhase === "shrink" ||
                          animationPhase === "reveal"
                        ? {
                            boxShadow:
                              "0 0 40px 15px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.2)",
                          }
                        : {}
                    }
                    transition={
                      animationPhase === "hold"
                        ? {
                            duration: ANIMATION_CONFIG.coverHoldDuration,
                            ease: "easeInOut",
                          }
                        : {
                            duration: 0.5,
                          }
                    }
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
                        duration: ANIMATION_CONFIG.revealDuration,
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
                              duration: ANIMATION_CONFIG.particleDuration,
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
                              duration: ANIMATION_CONFIG.particleDuration * 1.2,
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
                                  duration: ANIMATION_CONFIG.particleDuration,
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
            Pass an imageURL prop to see it dramatically cover the wall, hold
            for impact, then spin and zoom into a random tile!
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Total animation: ~{totalAnimationTime.toFixed(1)}s per image
          </p>
        </motion.div>
      </div>
    </div>
  );
}
