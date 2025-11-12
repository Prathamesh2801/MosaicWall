import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Sparkles } from "lucide-react";

export default function ImageDeform({
  imageURL,
  onImageUpload,
  autoPlay = false,
  showUpload = true,
}) {
  const [image, setImage] = useState(imageURL || null);
  const [pieces, setPieces] = useState([]);
  const [animate, setAnimate] = useState(false);
  //  { id: "pixelSpin", name: "Pixel Spin" },
  //  { id: "waveCollapse", name: "Wave" },
  //  { id: "spiralZoom", name: "Spiral" },
  //  { id: "explosionGather", name: "Explosion" },
  //  { id: "flipMosaic", name: "Flip" }
  const [animationType, setAnimationType] = useState("spiralZoom");

  const GRID_SIZE = 20;

  useEffect(() => {
    if (imageURL) {
      setImage(imageURL);
      if (autoPlay) {
        setTimeout(() => setAnimate(true), 1000);
      }
    }
  }, [imageURL, autoPlay]);

  useEffect(() => {
    if (!image) return;

    // Create grid pieces
    const temp = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        temp.push({
          id: row * GRID_SIZE + col,
          row,
          col,
        });
      }
    }
    setPieces(temp);

    if (autoPlay) {
      setTimeout(() => setAnimate(true), 1000);
    }
  }, [image, autoPlay]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
      setAnimate(false);
      if (onImageUpload) onImageUpload(imageURL);
    }
  };

  const getAnimationProps = (piece) => {
    const size = 400 / GRID_SIZE;
    const initialX = (Math.random() - 0.5) * 800;
    const initialY = (Math.random() - 0.5) * 800;
    const rotate = Math.random() * 720 - 360;

    const animations = {
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
          delay: (piece.col * 0.02) + (piece.row * 0.02),
          ease: [0.6, 0.05, 0.01, 0.9]
        }
      },
      spiralZoom: {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: { 
          duration: 1.8,
          delay: Math.sqrt(Math.pow(piece.col - GRID_SIZE/2, 2) + Math.pow(piece.row - GRID_SIZE/2, 2)) * 0.03,
          ease: "easeOut"
        }
      },
      explosionGather: {
        initial: { 
          x: (piece.col - GRID_SIZE/2) * 50,
          y: (piece.row - GRID_SIZE/2) * 50,
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
          delay: (piece.row + piece.col) * 0.03,
          ease: "easeInOut"
        }
      }
    };

    return animations[animationType] || animations.pixelSpin;
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
        <p className="text-slate-400 text-sm sm:text-base">Upload an image and watch it animate</p>
      </motion.div>

      {/* Upload Section */}
      {showUpload && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 w-full max-w-md"
        >
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-2 text-purple-400" />
              <p className="text-sm text-slate-300">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </motion.div>
      )}

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
            setAnimate(false);
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