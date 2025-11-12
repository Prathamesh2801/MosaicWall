import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Sparkles } from "lucide-react";

export default function ImageDeformAPI({
  imageURL,
  autoPlay = false,
  showUpload = true,
  onAnimationComplete,
}) {
  const [image, setImage] = useState(imageURL || null);
  const [pieces, setPieces] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [animationType, setAnimationType] = useState("spiralZoom");
  const GRID_SIZE = 20;
  const completionTimerRef = useRef(null);
  const completionCalledRef = useRef(false);

  // When imageURL prop changes, set image and optionally autoPlay
  useEffect(() => {
    if (imageURL) {
      setImage(imageURL);
      setAnimate(false);
      completionCalledRef.current = false;
      if (autoPlay) {
        // small delay so pieces are created first
        setTimeout(() => setAnimate(true), 1000);
      }
    }
  }, [imageURL, autoPlay]);

  // Create grid pieces and compute per-piece animation props once per image/animationType
  useEffect(() => {
    if (!image) {
      setPieces([]);
      return;
    }

    const temp = [];
    // We'll compute and attach animProps to each piece so delays/durations are deterministic
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const piece = {
          id: row * GRID_SIZE + col,
          row,
          col,
        };

        // compute animProps using the same logic as getAnimationProps
        const size = 400 / GRID_SIZE;
        const initialX = (Math.random() - 0.5) * 800;
        const initialY = (Math.random() - 0.5) * 800;
        const rotate = Math.random() * 720 - 360;

        const anims = {
          pixelSpin: {
            initial: { x: initialX, y: initialY, rotate, opacity: 0, scale: 0.5 },
            animate: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
            transition: { duration: 2, delay: Math.random() * 1.5, ease: "easeOut" }
          },
          waveCollapse: {
            initial: { y: -800, opacity: 0, scale: 0.3 },
            animate: { y: 0, opacity: 1, scale: 1 },
            transition: { 
              duration: 1.5, 
              delay: (col * 0.02) + (row * 0.02),
              ease: [0.6, 0.05, 0.01, 0.9]
            }
          },
          spiralZoom: {
            initial: { scale: 0, rotate: -180, opacity: 0 },
            animate: { scale: 1, rotate: 0, opacity: 1 },
            transition: { 
              duration: 1.8,
              delay: Math.sqrt(Math.pow(col - GRID_SIZE/2, 2) + Math.pow(row - GRID_SIZE/2, 2)) * 0.03,
              ease: "easeOut"
            }
          },
          explosionGather: {
            initial: { 
              x: (col - GRID_SIZE/2) * 50,
              y: (row - GRID_SIZE/2) * 50,
              scale: 0,
              opacity: 0
            },
            animate: { x: 0, y: 0, scale: 1, opacity: 1 },
            transition: {
              duration: 2,
              delay: Math.random() * 0.8,
              ease: [0.34, 1.56, 0.64, 1]
            }
          },
          flipMosaic: {
            initial: { rotateY: 180, opacity: 0, scale: 0.8 },
            animate: { rotateY: 0, opacity: 1, scale: 1 },
            transition: {
              duration: 1.2,
              delay: (row + col) * 0.03,
              ease: "easeInOut"
            }
          }
        };

        const chosen = anims[animationType] || anims.pixelSpin;
        // store computed anim props on the piece
        piece.animProps = chosen;
        temp.push(piece);
      }
    }

    setPieces(temp);

    // If autoPlay triggered earlier, ensure animate true after pieces created
    if (autoPlay) {
      setTimeout(() => setAnimate(true), 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, animationType]);

 

  // compute the maximum time any piece will take (delay + duration) to finish
  const computeMaxAnimationTime = () => {
    if (!pieces || pieces.length === 0) return 0;

    let max = 0;
    for (const p of pieces) {
      const t = (p.animProps && p.animProps.transition) || {};
      // Some transitions might not explicitly include duration/delay; handle defaults
      const duration = typeof t.duration === "number" ? t.duration : 1; // fallback 1s
      const delay = typeof t.delay === "number" ? t.delay : 0;
      const total = duration + delay;
      if (total > max) max = total;
    }
    // return milliseconds (+ small buffer)
    return Math.ceil(max * 1000 + 80);
  };

  // Start / restart the completion timeout whenever `animate` becomes true
  useEffect(() => {
    // clear previous timer
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    // reset completion flag if animation restarted manually
    if (!animate) {
      completionCalledRef.current = false;
      return;
    }

    // only schedule completion if we have pieces
    if (animate && pieces.length > 0) {
      const ms = computeMaxAnimationTime();
      // safety: if computed ms is 0, set default
      const timeoutMs = ms > 0 ? ms : 3500;

      completionTimerRef.current = setTimeout(() => {
        // ensure callback called only once
        if (!completionCalledRef.current) {
          completionCalledRef.current = true;
          if (typeof onAnimationComplete === "function") {
            try {
              onAnimationComplete();
            } catch (err) {
              console.error("onAnimationComplete threw:", err);
            }
          }
        }
      }, timeoutMs);
    }

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, pieces, onAnimationComplete]);

  // UI and rendering remain largely the same as your original component
  const getAnimationProps = (piece) => {
    // When rendering, use the precomputed animProps from piece to ensure identical timing
    return piece.animProps || {
      initial: { x: 0, y: 0, opacity: 1 },
      animate: { x: 0, y: 0, opacity: 1 },
      transition: { duration: 0.5, delay: 0 },
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
          Image Deform Studio
        </h1>
        {/* <p className="text-slate-400 text-sm sm:text-base">Upload an image and watch it animate</p> */}
      </motion.div>

    

      {/* Animation Type Selector */}
      {image && showUpload && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 w-full max-w-md"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Animation Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "pixelSpin", name: "Pixel Spin" },
              { id: "waveCollapse", name: "Wave" },
              { id: "spiralZoom", name: "Spiral" },
              { id: "explosionGather", name: "Explosion" },
              { id: "flipMosaic", name: "Flip" }
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => {
                  setAnimationType(anim.id);
                  setAnimate(false);
                  // reset completion flag so new animation will call completion again
                  completionCalledRef.current = false;
                  setTimeout(() => setAnimate(true), 100);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  animationType === anim.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {anim.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Image Display Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[400px] aspect-square bg-slate-800/50 overflow-hidden rounded-2xl shadow-2xl shadow-purple-900/50 backdrop-blur-sm border border-purple-500/20"
      >
        {!image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-400 text-sm">Upload an image to begin</p>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {image &&
            pieces.map((piece) => {
              const size = 400 / GRID_SIZE;
              const backgroundPosition = `-${piece.col * size}px -${piece.row * size}px`;
              const animProps = getAnimationProps(piece);

              return (
                <motion.div
                  key={piece.id}
                  initial={animProps.initial}
                  animate={animate ? animProps.animate : {}}
                  transition={animProps.transition}
                  className="absolute"
                  style={{
                    width: `${(100 / GRID_SIZE)}%`,
                    height: `${(100 / GRID_SIZE)}%`,
                    left: `${(piece.col * 100) / GRID_SIZE}%`,
                    top: `${(piece.row * 100) / GRID_SIZE}%`,
                    backgroundImage: `url(${image})`,
                    backgroundSize: "400px 400px",
                    backgroundPosition,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              );
            })}
        </AnimatePresence>
      </motion.div>

      {/* Control Button */}
      {image && showUpload && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            // replay: reset animate -> start again and reset completion flag
            setAnimate(false);
            completionCalledRef.current = false;
            setTimeout(() => setAnimate(true), 100);
          }}
          className="mt-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105"
        >
          <Play className="w-5 h-5" />
          Replay Animation
        </motion.button>
      )}
    </div>
  );
}
