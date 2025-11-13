import React, { useState, useEffect, useRef, useCallback } from "react";
import ImageDeformAPIDimension from "./ImageDeformAPIDimension";
import MosaicWallAPIDimension from "./MosaicWallAPIDimension";
import useSSE from "../../../hooks/useSSE";
import { BASE_URL } from "../../../../BASE_URL";

export default function DeformToMosaicAPIDimension() {
  const GRID_ROWS = 6;
  const GRID_COLS = 7;
  const totalTiles = GRID_ROWS * GRID_COLS;

  const CURRENT_DEFORM_ANIMATION = "rippleSpread";
  // [  "pixelSpin","waveCollapse","spiralZoom","explosionGather","flipMosaic","swirlDrop","rippleSpread","zoomRotate","foldUnfold","cascadeFlip" ]
  const [phase, setPhase] = useState("idle"); // idle | deform | mosaic
  const [imageURL, setImageURL] = useState(null);
  const [tiles, setTiles] = useState(() => Array(totalTiles).fill(null));
  const queueRef = useRef([]); // FIFO queue of image URLs
  const processingRef = useRef(false); // true when an image is being processed (deform->mosaic)
  const { data, eventType, isConnected } = useSSE("/sse_api.php?Status=False", {
    autoStart: true,
  });
  const recentProcessedRef = useRef(new Map()); // map: basePath -> timestamp
  const RECENT_MS = 5_000;

  // If rows/cols change at runtime (optional), ensure tiles length matches
  useEffect(() => {
    setTiles((prev) => {
      const next = Array(totalTiles).fill(null);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) {
        next[i] = prev[i];
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GRID_ROWS, GRID_COLS, totalTiles]);

  // Helper: normalize a URL to a base path (strip query params & origin)
  const normalizeImagePath = (fullUrl) => {
    try {
      // If fullUrl is relative, ensure we can parse it by providing a base
      const u = new URL(fullUrl, window.location.origin);
      // use pathname + filename (exclude search/query)
      return u.pathname.replace(/\/+/g, "/");
    } catch (err) {
      // fallback: strip query params manually
      return fullUrl.split("?")[0];
    }
  };

  // Helper: enqueue a new image (called from SSE event handler)
  const enqueueImage = useCallback(
    (url) => {
      const base = normalizeImagePath(url);

      // If the wall is full, ignore
      const filledCount = tiles.reduce((acc, t) => acc + (t ? 1 : 0), 0);
      if (filledCount >= totalTiles) {
        console.log("Mosaic full — ignoring incoming image", url);
        return;
      }

      // If currently processing this same image, ignore
      if (processingRef.current && imageURL) {
        const activeBase = normalizeImagePath(imageURL);
        if (activeBase === base) {
          console.log(
            "enqueueImage: currently processing same image -> ignore:",
            base
          );
          return;
        }
      }

      // If the same image already exists in queue, ignore
      const alreadyQueued = queueRef.current.some(
        (q) => normalizeImagePath(q) === base
      );
      if (alreadyQueued) {
        console.log("enqueueImage: image already queued -> ignore:", base);
        return;
      }

      // If the image was processed very recently, ignore (de-dupe bursts)
      const lastTs = recentProcessedRef.current.get(base) || 0;
      if (Date.now() - lastTs < RECENT_MS) {
        console.log("enqueueImage: image processed recently -> ignore:", base);
        return;
      }

      // push and attempt to start
      queueRef.current.push(url);
      console.log(
        "Enqueued image ->",
        url,
        " queueLen:",
        queueRef.current.length
      );
      processQueue();
    },
    [tiles, totalTiles, imageURL]
  );

  // Process queue: if not already processing and queue non-empty, dequeue and start pipeline
  const processQueue = useCallback(() => {
    if (processingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;
    processingRef.current = true;
    setImageURL(next);
    setPhase("deform");
  }, []);

  // SSE: push incoming user events into the queue (do not stop SSE)
  useEffect(() => {
    if (!eventType) return;

    if (eventType === "user" && data && data.data) {
      const imgPath = data.data.Image_Path || data.data.image_path || "";
      if (!imgPath) {
        console.warn("SSE user event missing Image_Path:", data);
        return;
      }
      const trimmed = imgPath.replace(/^\/+/, "");
      const full = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `${BASE_URL}/${trimmed}`;

      console.log("SSE: enqueueing image ->", full);
      enqueueImage(full);
    }
    // ignore heartbeats and other events
  }, [eventType, data, enqueueImage]);

  // When ImageDeform finishes, it calls this -> we start mosaic phase
  const handleDeformComplete = useCallback(() => {
    setPhase("mosaic");
  }, []);

  // When MosaicWall has finished revealing the tile for the current image, it calls this
  // We then mark processing as done and immediately process next queued image (if any)
  const handleMosaicRevealComplete = useCallback(() => {
    // mark processed (normalize)
    if (imageURL) {
      const base = normalizeImagePath(imageURL);
      recentProcessedRef.current.set(base, Date.now());
    }

    processingRef.current = false;
    setImageURL(null);
    setPhase("idle");
    setTimeout(() => {
      processQueue();
    }, 100);
  }, [processQueue, imageURL]);

  // Reset: clears tiles and also clears queue (server may still be sending)
  const handleResetAll = useCallback(() => {
    setTiles(Array(totalTiles).fill(null));
    queueRef.current = [];
    processingRef.current = false;
    setImageURL(null);
    setPhase("idle");
  }, [totalTiles]);

  return (
    <div className="min-h-screen ">
      {/* IMAGE DEFORM stage: only visible while deforming */}
      {phase === "deform" && imageURL && (
        <ImageDeformAPIDimension
          imageURL={imageURL}
          autoPlay={true}
          currentAnimation={CURRENT_DEFORM_ANIMATION}
          onAnimationComplete={handleDeformComplete}
        />
      )}

      {/* MOSAIC WALL: always shown (default view). When phase === "mosaic" and imageURL is set,
          MosaicWallAPI will run reveal for that image. When idle, it simply shows the current tiles. */}
      {phase !== "deform" && (
        <MosaicWallAPIDimension
          rows={GRID_ROWS}
          columns={GRID_COLS}
          imageURL={phase === "mosaic" ? imageURL : null} // only provide imageURL when we want a reveal run
          tiles={tiles}
          setTiles={setTiles}
          onReset={handleResetAll}
          // onUploadAgain={handleUploadAgain}
          onRevealComplete={handleMosaicRevealComplete}
        />
      )}
    </div>
  );
}
