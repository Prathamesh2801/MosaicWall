import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, RefreshCw } from "lucide-react";
import MosaicBG from "../assets/img/dummyBg.png";

export default function MosaicParticle() {
  const gridSize = 6;
  const totalTiles = gridSize * gridSize;

  // Timing (seconds)
  const ANIMATION_CONFIG = {
    initialDelay: 0.15,      // small pause
    coverDuration: 0.50,     // zoom-in to cover the wall
    gridDuration: 1.00,      // mosaic cut: tiles disappear
    particleDuration: 0.80,  // the flying particle travel time
    revealDuration: 0.60,    // tile fade-in on the wall
    particleSpinTurns: 2,    // particle spins while travelling
  };

  const totalAnimationTime =
    ANIMATION_CONFIG.initialDelay +
    ANIMATION_CONFIG.coverDuration +
    ANIMATION_CONFIG.gridDuration +
    ANIMATION_CONFIG.particleDuration +
    ANIMATION_CONFIG.revealDuration;

  // State
  const [tiles, setTiles] = useState(() => Array(totalTiles).fill(null));
  const [lastRevealedIndex, setLastRevealedIndex] = useState(null);
  const [animatingImage, setAnimatingImage] = useState(null);
  const [targetTileIndex, setTargetTileIndex] = useState(null);

  // Phases: 'cover' -> 'grid' -> 'particle' -> 'reveal'
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

    // Phase 1: cover (zoom in)
    setTimeout(() => setAnimationPhase("cover"), ANIMATION_CONFIG.initialDelay * 1000);

    // Phase 2: grid cut (tiles disappear)
    setTimeout(
      () => setAnimationPhase("grid"),
      (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration) * 1000
    );

    // Phase 3: particle flies to target tile
    setTimeout(
      () => setAnimationPhase("particle"),
      (ANIMATION_CONFIG.initialDelay + ANIMATION_CONFIG.coverDuration + ANIMATION_CONFIG.gridDuration) * 1000
    );

    // Phase 4: reveal tile (set data + highlight)
    setTimeout(() => {
      setAnimationPhase("reveal");
      const next = tiles.slice();
      next[pick] = dataUrl;
      setTiles(next);
      setLastRevealedIndex(pick);
    }, (
      ANIMATION_CONFIG.initialDelay +
      ANIMATION_CONFIG.coverDuration +
      ANIMATION_CONFIG.gridDuration +
      ANIMATION_CONFIG.particleDuration
    ) * 1000);

    // Cleanup after full sequence
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
      e.target.value = "";
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

  // Position (percent offsets from center) for particle travel
  const getTilePosition = (index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      x: (col - gridSize / 2 + 0.5) * 100,
      y: (row - gridSize / 2 + 0.5) * 100,
    };
  };

  // --- Inline helpers ---

  // Grid cut preview: ONLY tiles layer that disappear (no base image!)
  const GridCutDisappear = ({
    src,
    rows = 14,
    cols = 14,
    gridSize,
    targetTileIndex,
    tilesDuration,
  }) => {
    const tRow = Math.floor(targetTileIndex / gridSize);
    const tCol = targetTileIndex % gridSize;
    const targetR = (tRow + 0.5) * (rows / gridSize);
    const targetC = (tCol + 0.5) * (cols / gridSize);
    const maxDist = Math.hypot(
      Math.max(targetR, rows - targetR),
      Math.max(targetC, cols - targetC)
    );

    const tilesEls = [];
    const maxDelay = tilesDuration * 0.60;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = r * cols + c;
        const bgPosX = (c / (cols - 1)) * 100;
        const bgPosY = (r / (rows - 1)) * 100;

        const dist = Math.hypot(r + 0.5 - targetR, c + 0.5 - targetC);
        const norm = maxDist ? dist / maxDist : 0;
        const curved = Math.pow(norm, 0.75);       // stagger curve (far → earlier)
        const delay = Math.max(0, curved * maxDelay);
        const jitter = (Math.random() - 0.5) * 0.04;
        const finalDelay = Math.max(0, delay + jitter);

        // small random offset so disappearance feels like break-away
        const rand = (min, max) => Math.random() * (max - min) + min;
        const offX = rand(-50, 50);
        const offY = rand(-50, 50);
        const rot = rand(-30, 30);

        tilesEls.push(
          <motion.div
            key={id}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, x: offX, y: offY, rotate: rot, scale: 0.7 }}
            transition={{ delay: finalDelay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      }
    }

    return (
      <motion.div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 0,
          overflow: "hidden",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
        {tilesEls}
      </motion.div>
    );
  };

  // Single particle that flies to the target tile
  const ParticleFly = ({ toIndex, duration, spinTurns }) => {
    const { x, y } = getTilePosition(toIndex);
    return (
      <motion.div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          width: "28px",
          height: "28px",
          marginLeft: "-14px",
          marginTop: "-14px",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(168,85,247,0.85) 60%, rgba(168,85,247,0.2) 100%)",
          boxShadow:
            "0 0 18px 6px rgba(168,85,247,0.9), 0 0 32px 12px rgba(147,51,234,0.35)",
        }}
        initial={{ x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 1 }}
        animate={{ x: `${x}%`, y: `${y}%`, rotate: 360 * spinTurns, scale: 1 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Mosaic Wall Revealer
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <label className={`relative cursor-pointer group ${isFull || animatingImage ? "opacity-50 pointer-events-none" : ""}`}>
              <motion.div
                whileHover={{ scale: isFull || animatingImage ? 1 : 1.05 }}
                whileTap={{ scale: isFull || animatingImage ? 1 : 0.95 }}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                <Upload className="w-5 h-5" />
                <span>{isFull ? "Wall Complete" : animatingImage ? "Animating..." : "Upload to fill 1 tile"}</span>
              </motion.div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isFull || animatingImage} />
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
            {isFull ? " — 🎉 all done!" : " — upload again to reveal the next tile"}
          </p>

          {animationPhase && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-2 text-purple-300 text-sm">
              Phase:{" "}
              {animationPhase === "cover"
                ? "🔎 Zooming in..."
                : animationPhase === "grid"
                ? "🧩 Mosaic cut..."
                : animationPhase === "particle"
                ? "🟣 Traveling..."
                : "✨ Revealing!"}
            </motion.p>
          )}
        </motion.div>

        {/* Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-7xl mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img src={MosaicBG} alt="Background" className="w-full h-full object-cover" />
          </div>

          {/* COVER: zoom-in full image */}
          <AnimatePresence>
            {animatingImage && targetTileIndex !== null && animationPhase === "cover" && (
              <motion.div
                key="cover-layer"
                className="absolute inset-0 z-40"  // valid z-index
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${animatingImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  initial={{ scale: 0.85, opacity: 1 }}
                  animate={{ scale: 1.08, opacity: 1 }}
                  transition={{ duration: ANIMATION_CONFIG.coverDuration, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* GRID CUT: ONLY tiles that disappear (no base image) */}
          <AnimatePresence>
            {animatingImage && targetTileIndex !== null && animationPhase === "grid" && (
              <motion.div
                key="grid-cut-layer"
                className="absolute inset-0 z-50"   // ensure on top
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GridCutDisappear
                  src={animatingImage}
                  rows={14}
                  cols={14}
                  gridSize={gridSize}
                  targetTileIndex={targetTileIndex}
                  tilesDuration={ANIMATION_CONFIG.gridDuration}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* PARTICLE FLY: one particle travels to the target tile */}
          <AnimatePresence>
            {animatingImage && targetTileIndex !== null && animationPhase === "particle" && (
              <motion.div
                key="particle-layer"
                className="absolute inset-0 z-50"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ParticleFly
                  toIndex={targetTileIndex}
                  duration={ANIMATION_CONFIG.particleDuration}
                  spinTurns={ANIMATION_CONFIG.particleSpinTurns}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tiles on the wall */}
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
                  // FIX: use 'transparent' instead of ""
                  animate={{ backgroundColor: isRevealed ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.99)" }}
                >
                  {isRevealed && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: ANIMATION_CONFIG.revealDuration, ease: [0.34, 1.56, 0.64, 1] }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <img
                        src={src}
                        alt={`Tile ${index}`}
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ opacity: 0.4 }}
                      />

                      {isLatest && (
                        <>
                          {/* Expanding ring */}
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 1, scale: 0.8 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.8), 0 0 40px rgba(168,85,247,1)" }}
                          />
                          {/* Inner glow */}
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.95, ease: "easeOut" }}
                            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
                          />
                          {/* Particle burst */}
                          {[...Array(12)].map((_, i) => {
                            const angle = (i * Math.PI * 2) / 12;
                            return (
                              <motion.div
                                key={i}
                                className="absolute w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                                style={{ left: "50%", top: "50%", marginLeft: "-6px", marginTop: "-6px" }}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                animate={{ x: Math.cos(angle) * 80, y: Math.sin(angle) * 80, opacity: 0, scale: 0 }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mt-8 text-gray-300">
          <p className="text-sm">Flow: zoom-in → mosaic cut (tiles disappear) → flying particle → smooth tile reveal.</p>
          <p className="text-xs mt-2 text-gray-400">Total animation: ~{totalAnimationTime.toFixed(1)}s per upload</p>
        </motion.div>
      </div>
    </div>
  );
}
