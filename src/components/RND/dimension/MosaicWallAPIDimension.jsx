import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import MosaicBG from "../../../assets/img/dummyBg.png";

export default function MosaicWallAPIDimension({
  imageURL,
  onReset,
  tiles: propTiles,
  setTiles: setPropTiles,
  rows = 6, // Y (rows)
  columns = 6, // X (columns)
  onRevealComplete = null,
}) {
  const gridRows = rows;
  const gridCols = columns;
  const totalTiles = gridRows * gridCols;

  // Animation timing configuration (in seconds)
  const ANIMATION_CONFIG = {
    initialDelay: 0.3,
    coverDuration: 0.6,
    coverHoldDuration: 0.5,
    shrinkDuration: 1.2,
    revealDuration: 0.6,
    particleDuration: 0.8,
  };

  const totalAnimationTime =
    ANIMATION_CONFIG.initialDelay +
    ANIMATION_CONFIG.coverDuration +
    ANIMATION_CONFIG.coverHoldDuration +
    ANIMATION_CONFIG.shrinkDuration +
    ANIMATION_CONFIG.revealDuration;

  // Timeouts cleanup
  const timeoutIdsRef = useRef([]);

  // Use lifted tiles if provided, otherwise internal fallback
  const [internalTiles, setInternalTiles] = useState(() =>
    Array(totalTiles).fill(null)
  );

  // if parent provides tiles, use them; otherwise internal
  const tiles = propTiles ?? internalTiles;
  const setTiles = setPropTiles ?? setInternalTiles;

  // If rows/columns change, ensure internal tiles array has correct length
  useEffect(() => {
    if (!propTiles) {
      setInternalTiles((prev) => {
        const next = Array(totalTiles).fill(null);
        // copy over existing revealed tiles if possible (up to new length)
        for (let i = 0; i < Math.min(prev.length, next.length); i++) {
          next[i] = prev[i];
        }
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns, totalTiles]);

  const [lastRevealedIndex, setLastRevealedIndex] = useState(null);
  const [animatingImage, setAnimatingImage] = useState(null);
  const [targetTileIndex, setTargetTileIndex] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null);

  const filledCount = useMemo(
    () => tiles.reduce((acc, t) => acc + (t ? 1 : 0), 0),
    [tiles]
  );
  const isFull = filledCount === totalTiles;

  // Helper: tile sizes as percent of container
  const tileWidthPct = 100 / gridCols;
  const tileHeightPct = 100 / gridRows;

  // Return left/top percent (relative to container) for the tile's top-left corner
  const getTileLeftTop = (index) => {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    const left = col * tileWidthPct; // percentage of container width
    const top = row * tileHeightPct; // percentage of container height
    return {
      left: `${left}%`,
      top: `${top}%`,
    };
  };

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  const revealOneRandomTile = (dataUrl) => {
    const empty = [];
    for (let i = 0; i < tiles.length; i++) if (!tiles[i]) empty.push(i);
    if (!empty.length) return;

    const pick = empty[Math.floor(Math.random() * empty.length)];

    setAnimatingImage(dataUrl);
    setTargetTileIndex(pick);

    // schedule phases, store ids for cleanup
    timeoutIdsRef.current.push(
      setTimeout(
        () => setAnimationPhase("cover"),
        ANIMATION_CONFIG.initialDelay * 1000
      )
    );
    timeoutIdsRef.current.push(
      setTimeout(
        () => setAnimationPhase("hold"),
        (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration) * 1000
      )
    );
    timeoutIdsRef.current.push(
      setTimeout(
        () => setAnimationPhase("shrink"),
        (ANIMATION_CONFIG.initialDelay +
          ANIMATION_CONFIG.coverDuration +
          ANIMATION_CONFIG.coverHoldDuration) *
          1000
      )
    );

    // reveal and set tile
    timeoutIdsRef.current.push(
      setTimeout(() => {
        setAnimationPhase("reveal");
        const next = tiles.slice();
        next[pick] = dataUrl;
        setTiles(next);
        setLastRevealedIndex(pick);
      }, (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration + ANIMATION_CONFIG.coverHoldDuration + ANIMATION_CONFIG.shrinkDuration) * 1000)
    );

    // cleanup end of run
    timeoutIdsRef.current.push(
      setTimeout(() => {
        setAnimatingImage(null);
        setTargetTileIndex(null);
        setAnimationPhase(null);

        timeoutIdsRef.current.push(
          setTimeout(() => setLastRevealedIndex(null), 1000)
        );

        // notify parent
        try {
          if (typeof onRevealComplete === "function") {
            onRevealComplete();
          }
        } catch (err) {
          console.error("onRevealComplete threw:", err);
        }
      }, totalAnimationTime * 1000)
    );
  };

  // When imageURL prop changes -> reveal one random tile (unless wall is full)
  useEffect(() => {
    if (imageURL && !isFull) {
      revealOneRandomTile(imageURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageURL]);

  // cleanup on unmount or dimension change
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Reset handler: if parent provided onReset, call it (parent may clear tiles)
  const handleReset = () => {
    if (!propTiles) {
      setTiles(Array(totalTiles).fill(null));
    } else {
      if (onReset) onReset();
    }
    setLastRevealedIndex(null);
    setAnimatingImage(null);
    setTargetTileIndex(null);
    setAnimationPhase(null);
    clearAllTimeouts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-2 px-4">
      <div className=" mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full  mx-auto aspect-square rounded-xl overflow-hidden shadow-2xl"
          style={{ height: "80vh", width: "95vw" }}
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
                className="absolute inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Full screen flash effect */}
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

                {/* Animating image - now uses left/top for accurate positioning */}
                <motion.div
                  className="absolute overflow-hidden"
                  style={{
                    borderRadius:
                      animationPhase === "shrink" || animationPhase === "reveal"
                        ? "0.75rem"
                        : "1rem",
                    position: "absolute",
                    left: "0%",
                    top: "0%",
                  }}
                  initial={{
                    width: "0%",
                    height: "0%",
                    left: "0%",
                    top: "0%",
                    scale: 0.8,
                    rotate: 0,
                  }}
                  animate={
                    animationPhase === "cover"
                      ? {
                          width: "100%",
                          height: "100%",
                          left: "0%",
                          top: "0%",
                          scale: 1,
                          rotate: 0,
                        }
                      : animationPhase === "hold"
                      ? {
                          width: "100%",
                          height: "100%",
                          left: "0%",
                          top: "0%",
                          scale: [1, 1.02, 1],
                          rotate: 0,
                        }
                      : animationPhase === "shrink" || animationPhase === "reveal"
                      ? {
                          width: `${tileWidthPct}%`,
                          height: `${tileHeightPct}%`,
                          ...getTileLeftTop(targetTileIndex),
                          scale: 1,
                          rotate: 720,
                        }
                      : {}
                  }
                  transition={
                    animationPhase === "cover"
                      ? {
                          duration: ANIMATION_CONFIG.coverDuration,
                          ease: [0.22, 1, 0.36, 1],
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
                      : animationPhase === "shrink" || animationPhase === "reveal"
                      ? {
                          duration: ANIMATION_CONFIG.shrinkDuration,
                          ease: [0.65, 0, 0.35, 1],
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
                        : animationPhase === "shrink" || animationPhase === "reveal"
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
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gridTemplateRows: `repeat(${gridRows}, 1fr)`,
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
                    backgroundColor: isRevealed
                      ? "rgba(0,0,0,0)"
                      : "rgba(0,0,0,0.99)",
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

                          {/* Particle burst */}
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
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            }}
          >
            {Array.from({ length: totalTiles }).map((_, i) => (
              <div key={`grid-${i}`} className="border border-white/5" />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
