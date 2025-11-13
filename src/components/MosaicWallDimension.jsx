import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, RefreshCw } from "lucide-react";
import MosaicBG from "../assets/img/dummyBg.png";

export default function MosaicWallDimension() {
  // ==== Set your grid dimensions here ====
  const gridCols = 2; // X (columns)
  const gridRows = 8; // Y (rows)

  const totalTiles = gridCols * gridRows;

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

  // Each tile holds the uploaded image's dataURL (or null if empty)
  const [tiles, setTiles] = useState(() => Array(totalTiles).fill(null));
  const [lastRevealedIndex, setLastRevealedIndex] = useState(null);
  const [animatingImage, setAnimatingImage] = useState(null);
  const [targetTileIndex, setTargetTileIndex] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null); // 'cover' | 'hold' | 'shrink' | 'reveal'

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

    // Start the animation sequence
    setAnimatingImage(dataUrl);
    setTargetTileIndex(pick);

    // Phase timings
    setTimeout(() => setAnimationPhase("cover"), ANIMATION_CONFIG.initialDelay * 1000);
    setTimeout(
      () => setAnimationPhase("hold"),
      (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration) * 1000
    );
    setTimeout(
      () => setAnimationPhase("shrink"),
      (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration + ANIMATION_CONFIG.coverHoldDuration) * 1000
    );
    setTimeout(() => {
      setAnimationPhase("reveal");
      const next = tiles.slice();
      next[pick] = dataUrl;
      setTiles(next);
      setLastRevealedIndex(pick);
    },
      (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration + ANIMATION_CONFIG.coverHoldDuration + ANIMATION_CONFIG.shrinkDuration) * 1000
    );

    // Cleanup
    setTimeout(() => {
      setAnimatingImage(null);
      setTargetTileIndex(null);
      setAnimationPhase(null);
      setTimeout(() => setLastRevealedIndex(null), 1000);
    }, totalAnimationTime * 1000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      revealOneRandomTile(reader.result);
      e.target.value = ""; // allow re-uploading the same file
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setTiles(Array(totalTiles).fill(null));
    setLastRevealedIndex(null);
    setAnimatingImage(null);
    setTargetTileIndex(null);
    setAnimationPhase(null);
  };

  // ---- Helpers for rectangular grids ----
  const tileWidthPct = 100 / gridCols;
  const tileHeightPct = 100 / gridRows;

  // Translate (from center) to the center of the target tile in %
  const getTileTranslatePercent = (index) => {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    const centerX = (col + 0.5) * tileWidthPct;   // 0% ... 100%
    const centerY = (row + 0.5) * tileHeightPct;  // 0% ... 100%
    return {
      x: `${centerX - 50}%`,
      y: `${centerY - 50}%`,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-5">
      <div>
   

        {/* Mosaic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square overflow-hidden mx-auto shadow-2xl"
          style={{height:'95vh', width:'95vw'}}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img src={MosaicBG} alt="Background" className="w-full h-full object-cover" />
          </div>

          {/* Animating Image Overlay */}
          <AnimatePresence>
            {animatingImage && targetTileIndex !== null && (
              <motion.div className="absolute inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Full-screen flash on start */}
                {animationPhase === "cover" && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ duration: ANIMATION_CONFIG.coverDuration, times: [0, 0.5, 1], ease: "easeInOut" }}
                  />
                )}

                {/* Animating image block */}
                <motion.div
                  className="absolute overflow-hidden"
                  style={{ borderRadius: animationPhase === "shrink" || animationPhase === "reveal" ? "0.75rem" : "1rem" }}
                  initial={{ width: "0%", height: "0%", x: 0, y: 0, scale: 0.8, rotate: 0 }}
                  animate={
                    animationPhase === "cover"
                      ? { width: "100%", height: "100%", x: 0, y: 0, scale: 1, rotate: 0 }
                      : animationPhase === "hold"
                      ? { width: "100%", height: "100%", x: 0, y: 0, scale: [1, 1.02, 1], rotate: 0 }
                      : animationPhase === "shrink" || animationPhase === "reveal"
                      ? {
                          width: `${tileWidthPct}%`,
                          height: `${tileHeightPct}%`,
                          ...getTileTranslatePercent(targetTileIndex),
                          scale: 1,
                          rotate: 720, // two spins
                        }
                      : {}
                  }
                  transition={
                    animationPhase === "cover"
                      ? { duration: ANIMATION_CONFIG.coverDuration, ease: [0.22, 1, 0.36, 1] }
                      : animationPhase === "hold"
                      ? {
                          duration: ANIMATION_CONFIG.coverHoldDuration,
                          scale: { duration: ANIMATION_CONFIG.coverHoldDuration, repeat: 0, ease: "easeInOut" },
                        }
                      : animationPhase === "shrink" || animationPhase === "reveal"
                      ? {
                          duration: ANIMATION_CONFIG.shrinkDuration,
                          ease: [0.65, 0, 0.35, 1],
                          rotate: { duration: ANIMATION_CONFIG.shrinkDuration, ease: [0.65, 0, 0.35, 1] },
                        }
                      : {}
                  }
                >
                  <img src={animatingImage} alt="Animating" className="w-full h-full object-cover" />
                  {/* Glow */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={
                      animationPhase === "cover"
                        ? { boxShadow: "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)" }
                        : animationPhase === "hold"
                        ? {
                            boxShadow: [
                              "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                              "0 0 100px 40px rgba(168,85,247,1), inset 0 0 80px rgba(255,255,255,0.5)",
                              "0 0 80px 30px rgba(168,85,247,0.9), inset 0 0 60px rgba(255,255,255,0.4)",
                            ],
                          }
                        : animationPhase === "shrink" || animationPhase === "reveal"
                        ? { boxShadow: "0 0 40px 15px rgba(168,85,247,0.6), inset 0 0 20px rgba(255,255,255,0.2)" }
                        : {}
                    }
                    transition={animationPhase === "hold" ? { duration: ANIMATION_CONFIG.coverHoldDuration, ease: "easeInOut" } : { duration: 0.5 }}
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
                <motion.div key={index} className="relative overflow-hidden" initial={false} animate={{ backgroundColor: isRevealed ? "" : "rgba(0,0,0,0.99)" }}>
                  {isRevealed && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: ANIMATION_CONFIG.revealDuration, ease: [0.34, 1.56, 0.64, 1] }}
                      whileHover={{ scale: 1.03 }}
                    >
                      {/* Show the uploaded image "as is" in each tile */}
                      <img src={src} alt={`Tile ${index}`} className="w-full h-full object-cover pointer-events-none" style={{ opacity: 0.4 }} />

                      {isLatest && (
                        <>
                          {/* Expanding ring */}
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 1, scale: 0.8 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: ANIMATION_CONFIG.particleDuration, ease: "easeOut" }}
                            style={{ boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.8), 0 0 40px rgba(168,85,247,1)" }}
                          />

                          {/* Inner glow */}
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: ANIMATION_CONFIG.particleDuration * 1.2, ease: "easeOut" }}
                            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
                          />

                          {/* Particles */}
                          {[...Array(12)].map((_, i) => {
                            const angle = (i * Math.PI * 2) / 12;
                            return (
                              <motion.div
                                key={i}
                                className="absolute w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                                style={{ left: "50%", top: "50%", marginLeft: "-6px", marginTop: "-6px" }}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                animate={{ x: Math.cos(angle) * 80, y: Math.sin(angle) * 80, opacity: 0, scale: 0 }}
                                transition={{ duration: ANIMATION_CONFIG.particleDuration, ease: [0.22, 1, 0.36, 1] }}
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

          {/* Grid lines */}
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
