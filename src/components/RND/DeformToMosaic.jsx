import React, { useState, useEffect } from "react";
import ImageDeform from "./ImageDeform";
import MosaicWall from "./MosaicWallM";

export default function DeformToMosaic() {
  const GRID_SIZE = 6;
  const totalTiles = GRID_SIZE * GRID_SIZE;

  const [phase, setPhase] = useState("upload"); // "upload" | "deform" | "mosaic"
  const [uploadedImage, setUploadedImage] = useState(null);

  // Lifted tiles state so it persists while switching phases
  const [tiles, setTiles] = useState(() => Array(totalTiles).fill(null));

  // Use this to trigger showing mosaic after deform step
  const handleImageSelected = (imageUrl) => {
    setUploadedImage(imageUrl);
    setPhase("deform");

    // Wait 5 seconds (same behaviour as before), then show mosaic
    setTimeout(() => {
      setPhase("mosaic");
    }, 5000);
  };

  // Called by MosaicWall when user clicks "Reset Wall"
  const handleResetAll = () => {
    setTiles(Array(totalTiles).fill(null));
    setUploadedImage(null);
    setPhase("upload");
  };

  // Called by MosaicWall when user wants to go back to upload but keep tiles
  const handleUploadAgain = () => {
    // intentionally keep tiles as-is -> this preserves revealed tiles
    setPhase("upload");
    // keep uploadedImage (optional) — if you want to clear preview, setUploadedImage(null)
  };

  // When returning to upload, ImageDeform will call handleImageSelected
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {phase === "upload" && (
        <ImageDeform
          onImageUpload={handleImageSelected}
          autoPlay={false}
          showUpload={true}
        />
      )}

      {phase === "deform" && uploadedImage && (
        <ImageDeform
          imageURL={uploadedImage}
          autoPlay={true}
          showUpload={false}
        />
      )}

      {phase === "mosaic" && uploadedImage && (
        <MosaicWall
          gridSize={GRID_SIZE}
          imageURL={uploadedImage}
          tiles={tiles}
          setTiles={setTiles}
          onReset={handleResetAll}
          onUploadAgain={handleUploadAgain}
        />
      )}
    </div>
  );
}
