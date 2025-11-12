// DeformToMosaicAPI.jsx (show MosaicWall by default)
import React, { useState, useEffect, useRef, useCallback } from "react";
import ImageDeformAPI from "./ImageDeformAPI";
import useSSE from "../../../hooks/useSSE"; // adjust path if needed
import { BASE_URL } from "../../../../BASE_URL"; // keep your existing path
import MosaicWallAPI from "./MosaicWallAPI";

export default function DeformToMosaicAPI() {
  const GRID_SIZE = 6;
  const totalTiles = GRID_SIZE * GRID_SIZE;

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

  // Helper: enqueue a new image (called from SSE event handler)
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

  // Upload again: preserve revealed tiles but allow next server image to be consumed
  const handleUploadAgain = useCallback(() => {
    // Just ensure processing flag is false so queued images will be processed
    processingRef.current = false;
    setPhase("idle");
    // processQueue() will be triggered when queue has items (enqueueImage calls it)
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Deform → Mosaic pipeline (SSE queue)
      </h2>

      {/* Top status / debug area */}
      <div className="mb-4">
        <p className="mb-1">
          Connection: {isConnected ? "🟢 connected" : "🔴 disconnected"} —
          Queue: {queueRef.current.length} — Processing:{" "}
          {processingRef.current ? "yes" : "no"}
        </p>
        <div className="text-sm text-gray-300 mb-2">
          Server emits <code>user</code> events with <code>Image_Path</code>.
          Images are queued and processed one-by-one.
        </div>
        {/* Optional debug payload */}
        {data && eventType === "user" && (
          <pre className="bg-gray-800 p-3 rounded text-xs max-w-xl overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>

      {/* IMAGE DEFORM stage: only visible while deforming */}
      {phase === "deform" && imageURL && (
        <ImageDeformAPI
          imageURL={imageURL}
          showUpload={false}
          autoPlay={true}
          onAnimationComplete={handleDeformComplete}
        />
      )}

      {/* MOSAIC WALL: always shown (default view). When phase === "mosaic" and imageURL is set,
          MosaicWallM will run reveal for that image. When idle, it simply shows the current tiles. */}
      {phase !== "deform" && (
        <div className="mt-6">
          <MosaicWallAPI
            gridSize={GRID_SIZE}
            imageURL={phase === "mosaic" ? imageURL : null} // only provide imageURL when we want a reveal run
            tiles={tiles}
            setTiles={setTiles}
            onReset={handleResetAll}
            onUploadAgain={handleUploadAgain}
            onRevealComplete={handleMosaicRevealComplete}
          />
        </div>
      )}
    </div>
  );
}
