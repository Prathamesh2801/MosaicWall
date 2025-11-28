import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ----------------- Helper functions -----------------
const hashString = (s) => {
  if (!s) return 0; // handle null/undefined/empty
  s = String(s); // ensure it's a string

  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const seededRandom = (seed) => {
  // returns function() -> 0..1
  let state = seed >>> 0;
  return function () {
    state = (state ^ (state << 13)) >>> 0;
    state = (state ^ (state >>> 17)) >>> 0;
    state = (state ^ (state << 5)) >>> 0;
    return (state >>> 0) / 4294967295;
  };
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin +
  ((clamp(v, inMin, inMax) - inMin) * (outMax - outMin)) / (inMax - inMin);

// Place images in grid with simple occupancy to avoid overlaps
const placeImagesInGrid = (items, cols = 20, rows = 30) => {
  const occ = Array.from({ length: rows }, () => Array(cols).fill(false));
  const placed = [];

  const findSpace = (w, h) => {
    for (let r = 0; r <= rows - h; r++) {
      for (let c = 0; c <= cols - w; c++) {
        let ok = true;
        for (let rr = r; rr < r + h && ok; rr++) {
          for (let cc = c; cc < c + w; cc++) {
            if (occ[rr][cc]) {
              ok = false;
              break;
            }
          }
        }
        if (ok) return { r, c };
      }
    }
    return null;
  };

  for (let i = 0; i < items.length; i++) {
    const url = items[i].url || "";
    // deterministic random from url
    const rand = seededRandom(hashString(url) ^ 0x9e3779b9);
    const r1 = rand();
    const r2 = rand();

    const colSpan = 2 + Math.floor(r1 * 4); // 2..5
    const rowSpan = 2 + Math.floor(r2 * 5); // 2..6

    const pos = findSpace(colSpan, rowSpan);

    if (pos) {
      for (let rr = pos.r; rr < pos.r + rowSpan; rr++) {
        for (let cc = pos.c; cc < pos.c + colSpan; cc++) {
          occ[rr][cc] = true;
        }
      }
      placed.push({
        ...items[i],
        gridArea: `${pos.r + 1}/${pos.c + 1}/${pos.r + 1 + rowSpan}/${
          pos.c + 1 + colSpan
        }`,
      });
    } else {
      // fallback placement if grid is packed
      const fallbackR = Math.min(rows - 1, Math.floor((i * 3) % rows));
      const fallbackC = Math.min(cols - 1, Math.floor((i * 5) % cols));
      placed.push({
        ...items[i],
        gridArea: `${fallbackR + 1}/${fallbackC + 1}/${Math.min(
          rows,
          fallbackR + 3
        )}/${Math.min(cols, fallbackC + 4)}`,
      });
    }
  }

  return placed;
};

// compute base speed from seed and then adjust by aspect ratio if available
const computeSpeed = (seedValue, naturalWidth = 1, naturalHeight = 1) => {
  // seeded base in [0.7, 1.3]
  const rnd = seededRandom(seedValue)();
  let speed = mapRange(rnd, 0, 1, 0.7, 1.3);

  // aspect ratio adjustment: tall images slightly faster, wide images slightly slower
  const ar = naturalHeight / naturalWidth; // >1 tall, <1 wide
  speed *= mapRange(ar, 0.5, 2.0, 0.85, 1.15); // clamp effect
  return clamp(speed, 0.45, 2.5);
};

// ----------------- Component -----------------
const ScrollyImages = ({
  imagesFromApi = null, // array of { url } OR null to use fallbacks
  speed = 3,
  smoothness = 1.5,
  autoScrollSpeed = 6,
  enableAutoScroll = true,
  gridCols = 25,
  gridRows = 30,
}) => {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const imagesRef = useRef([]);
  const autoScrollRef = useRef(null);
  const [isManualScroll, setIsManualScroll] = useState(false);

  // fallback dummy images (your original images if api not provided)
  const fallbackImages = [
    {
      url: "https://images.unsplash.com/photo-1556856425-366d6618905d?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1520271348391-049dd132bb7c?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1609166214994-502d326bafee?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1589882265634-84f7eb9a3414?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1514689832698-319d3bcac5d5?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1535207010348-71e47296838a?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1588007375246-3ee823ef4851?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1571450669798-fcb4c543f6a4?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1556856425-366d6618905d?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1520271348391-049dd132bb7c?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1609166214994-502d326bafee?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1589882265634-84f7eb9a3414?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1514689832698-319d3bcac5d5?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1535207010348-71e47296838a?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1588007375246-3ee823ef4851?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1571450669798-fcb4c543f6a4?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1556856425-366d6618905d?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1520271348391-049dd132bb7c?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1609166214994-502d326bafee?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1589882265634-84f7eb9a3414?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1514689832698-319d3bcac5d5?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1535207010348-71e47296838a?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1588007375246-3ee823ef4851?w=400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1571450669798-fcb4c543f6a4?w=400&q=80",
    },
  ];

  const sourceImages =
    imagesFromApi && imagesFromApi.length > 0 ? imagesFromApi : fallbackImages;

  // enriched state contains: { url, gridArea, speed, naturalWidth?, naturalHeight? }
  const [enriched, setEnriched] = useState([]);

  useEffect(() => {
    let mounted = true;

    const seedForUrl = (url) => hashString(url) ^ 0x9e3779b9;

    const items = sourceImages.map((it) => ({ url: it.url }));

    // just call placeImagesInGrid without seedFn
    const placed = placeImagesInGrid(items, gridCols, gridRows);

    const promises = placed.map(
      (p, idx) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = p.url;
          img.onload = () => {
            const seedVal = seedForUrl(p.url) + idx;
            const sp = computeSpeed(
              seedVal,
              img.naturalWidth || 1,
              img.naturalHeight || 1
            );
            resolve({
              ...p,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              speed: sp,
            });
          };
          img.onerror = () => {
            const seedVal = seedForUrl(p.url) + idx;
            resolve({
              ...p,
              naturalWidth: 1,
              naturalHeight: 1,
              speed: computeSpeed(seedVal, 1, 1),
            });
          };
        })
    );

    Promise.all(promises).then((results) => {
      if (mounted) setEnriched(results);
    });

    return () => {
      mounted = false;
    };
  }, [imagesFromApi, gridCols, gridRows]);

  // Use GSAP and ScrollTrigger like before, but use enriched array
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    let scrollTween;
    let manualScrollTimeout;

    // guard
    if (!wrapper || !enriched || enriched.length === 0) return;

    // Clear previous triggers to avoid duplicates
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // Create parallax effect for images: use individual image.speed
    imagesRef.current.forEach((imgEl, index) => {
      const imgData = enriched[index];
      if (imgEl && imgData) {
        gsap.to(imgEl, {
          yPercent: -30 * (imgData.speed ?? 1),
          ease: "none",
          scrollTrigger: {
            trigger: imgEl,
            start: "top bottom",
            end: "bottom top",
            scrub: smoothness,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    // Auto scroll functionality
    if (enableAutoScroll) {
      const startAutoScroll = () => {
        if (!isManualScroll) {
          scrollTween = gsap.to(wrapper, {
            scrollTop: "+=3000",
            duration: 50 / autoScrollSpeed,
            ease: "none",
            repeat: -1,
            onRepeat: () => {
              if (
                wrapper.scrollTop >=
                wrapper.scrollHeight - wrapper.clientHeight - 10
              ) {
                wrapper.scrollTop = 0;
              }
            },
          });
        }
      };

      startAutoScroll();
      autoScrollRef.current = scrollTween;
    }

    // Handle manual scroll to pause auto scroll
    const handleScroll = () => {
      if (scrollTween) {
        scrollTween.pause();
      }
      setIsManualScroll(true);

      clearTimeout(manualScrollTimeout);
      manualScrollTimeout = setTimeout(() => {
        setIsManualScroll(false);
        if (enableAutoScroll && scrollTween) {
          scrollTween.play();
        }
      }, 2000);
    };

    wrapper.addEventListener("wheel", handleScroll, { passive: true });
    wrapper.addEventListener("touchstart", handleScroll, { passive: true });

    // Skew effect on scroll
    let skewSetter = gsap.quickSetter(imagesRef.current, "skewY");
    let clampFn = gsap.utils.clamp(-15, 15);
    let lastScrollTop = 0;
    let velocity = 0;

    const updateSkew = () => {
      const currentScrollTop = wrapper.scrollTop;
      velocity = (currentScrollTop - lastScrollTop) * 0.5;
      skewSetter(clampFn(velocity / -10));
      lastScrollTop = currentScrollTop;

      if (Math.abs(velocity) < 0.1) {
        skewSetter(0);
      }
    };

    wrapper.addEventListener("scroll", updateSkew, { passive: true });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (scrollTween) scrollTween.kill();
      wrapper.removeEventListener("wheel", handleScroll);
      wrapper.removeEventListener("touchstart", handleScroll);
      wrapper.removeEventListener("scroll", updateSkew);
      clearTimeout(manualScrollTimeout);
    };
  }, [enriched, smoothness, autoScrollSpeed, enableAutoScroll, isManualScroll]);

  // Render
  return (
    <div className="relative w-full h-screen bg-[#1a1721] overflow-hidden">
      {/* Title with effects (kept from original) */}
      <h1
        className="fixed top-1/2 left-0 right-0 -translate-y-full text-center text-[8vw] font-black text-white z-[-2]"
        style={{ WebkitTextStroke: "1.5px white" }}
      >
        Scrolly Images
      </h1>

      <div
        ref={wrapperRef}
        className="fixed inset-0 overflow-y-scroll overflow-x-hidden"
        style={{
          overscrollBehavior: "none",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        <div ref={contentRef} className="w-full">
          <div
            className="relative w-full  pt-[60vh] pb-[40vh]"
            // className="relative w-full max-w-[1200px] mx-auto min-h-[150vh] pt-[60vh] pb-[40vh]"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 2%)`,
              gridTemplateRows: `repeat(${gridRows}, 3%)`,
              justifyContent: "center",
              justifyItems: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {enriched.map((image, index) => (
              <img
                key={index}
                ref={(el) => (imagesRef.current[index] = el)}
                src={image.url}
                alt={`Scrolly image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                style={{
                  gridArea: image.gridArea,
                  transition: "transform 0.25s ease",
                }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls overlay */}
      <div className="fixed bottom-8 right-8 bg-black/50 backdrop-blur-sm p-4 rounded-lg z-10 text-white text-sm">
        <div className="flex flex-col gap-2">
          <div>Parallax Speed Multiplier: {speed}x</div>
          <div>Auto Scroll Speed : {autoScrollSpeed}</div>
          <div>Auto Scroll: {enableAutoScroll ? "ON" : "OFF"}</div>
          <div className="text-xs text-gray-400 mt-2">
            Scroll to pause auto-scroll
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollyImages;
