import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollyImages = ({
  speed = 0.5,
  smoothness = 1.5,
  autoScrollSpeed = 1,
  enableAutoScroll = true,
  infiniteScroll = false,
}) => {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const imagesRef = useRef([]);
  const autoScrollRef = useRef(null);
  const [isManualScroll, setIsManualScroll] = useState(false);

  // Dummy image data with different speeds
  const images = [
    {
      url: "https://images.unsplash.com/photo-1556856425-366d6618905d?w=400&q=80",
      speed: 0.8,
      gridArea: "1/1/6/8",
    },
    {
      url: "https://images.unsplash.com/photo-1520271348391-049dd132bb7c?w=400&q=80",
      speed: 0.9,
      gridArea: "3/12/8/20",
    },
    {
      url: "https://images.unsplash.com/photo-1609166214994-502d326bafee?w=400&q=80",
      speed: 1,
      gridArea: "9/5/13/15",
    },
    {
      url: "https://images.unsplash.com/photo-1589882265634-84f7eb9a3414?w=400&q=80",
      speed: 1.1,
      gridArea: "14/1/18/8",
    },
    {
      url: "https://images.unsplash.com/photo-1514689832698-319d3bcac5d5?w=400&q=80",
      speed: 0.9,
      gridArea: "16/12/20/19",
    },
    {
      url: "https://images.unsplash.com/photo-1535207010348-71e47296838a?w=400&q=80",
      speed: 1.2,
      gridArea: "20/2/25/9",
    },
    {
      url: "https://images.unsplash.com/photo-1588007375246-3ee823ef4851?w=400&q=80",
      speed: 0.8,
      gridArea: "22/11/24/20",
    },
    {
      url: "https://images.unsplash.com/photo-1571450669798-fcb4c543f6a4?w=400&q=80",
      speed: 1,
      gridArea: "26/5/30/15",
    },
   
  ];

  // how many rows the single layout uses — duplicated when infiniteScroll is true
  const ROWS = 30;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    let scrollTween;
    let manualScrollTimeout;

    // Create parallax effect for images (supports duplicated list)
    imagesRef.current.forEach((img, index) => {
      if (img) {
        const baseImg = images[index % images.length];
        gsap.to(img, {
          yPercent: -30 * baseImg.speed,
          ease: "none",
          scrollTrigger: {
            trigger: img,
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
          // compute height of one block (single layout). Use this as the loop distance
          const imagesGrid = content.querySelector(".images-grid");
          const singleBlockHeight = imagesGrid
            ? imagesGrid.scrollHeight / (infiniteScroll ? 2 : 1)
            : 3000;

          const scrollDistance = infiniteScroll ? singleBlockHeight : 3000;
          // Scale duration based on original mapping (3000 px -> 50 seconds)
          const duration = infiniteScroll
            ? (singleBlockHeight / 3000) * (50 / autoScrollSpeed)
            : 50 / autoScrollSpeed;

          scrollTween = gsap.to(wrapper, {
            scrollTop: `+=${scrollDistance}`,
            duration,
            ease: "none",
            repeat: -1,
            onRepeat: () => {
              if (infiniteScroll && singleBlockHeight > 0) {
                // shift scroll position back by the singleBlockHeight to create seamless loop
                wrapper.scrollTop = wrapper.scrollTop - singleBlockHeight;
              } else if (
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

    // Handle manual scroll
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

    wrapper.addEventListener("wheel", handleScroll);
    wrapper.addEventListener("touchstart", handleScroll);

    // Skew effect on scroll
    let skewSetter = gsap.quickSetter(imagesRef.current, "skewY");
    let clamp = gsap.utils.clamp(-15, 15);
    let lastScrollTop = 0;
    let velocity = 0;

    const updateSkew = () => {
      const currentScrollTop = wrapper.scrollTop;
      velocity = (currentScrollTop - lastScrollTop) * 0.5;
      skewSetter(clamp(velocity / -10));
      lastScrollTop = currentScrollTop;

      if (Math.abs(velocity) < 0.1) {
        skewSetter(0);
      }
    };

    wrapper.addEventListener("scroll", updateSkew);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (scrollTween) scrollTween.kill();
      wrapper.removeEventListener("wheel", handleScroll);
      wrapper.removeEventListener("touchstart", handleScroll);
      wrapper.removeEventListener("scroll", updateSkew);
      clearTimeout(manualScrollTimeout);
    };
  }, [speed, smoothness, autoScrollSpeed, enableAutoScroll, isManualScroll, infiniteScroll]);

  const renderedImages = infiniteScroll
    ? images.flatMap((img) => [{ ...img, _copyIdx: 0 }, { ...img, _copyIdx: 1 }])
    : images.map((img) => ({ ...img, _copyIdx: 0 }));
  // clear old refs (pre-emptive) so refs align with renderedImages length
  imagesRef.current = [];

  return (
    <div className="relative w-full h-screen bg-[#1a1721] overflow-hidden">
      {/* Title with effects */}
      <h1
        className="fixed top-1/2 left-0 right-0 -translate-y-full text-center text-[8vw] font-black text-white z-[-2]"
        style={{ WebkitTextStroke: "1.5px white" }}
      >
        Scrolly Images
      </h1>
      <h1
        className="fixed top-1/2 left-0 right-0 -translate-y-full text-center text-[8vw] font-black text-transparent z-[2]"
        style={{ WebkitTextStroke: "1.5px white" }}
        aria-hidden="true"
      >
        Scrolly Images
      </h1>
      <h1
        className="fixed top-1/2 left-0 right-0 -translate-y-full text-center text-[8vw] font-black text-[#804691] z-[2]"
        style={{ mixBlendMode: "screen" }}
        aria-hidden="true"
      >
        Scrolly Images
      </h1>

      {/* Scrollable wrapper */}
      <div
        ref={wrapperRef}
        className="fixed inset-0 overflow-y-scroll overflow-x-hidden"
        style={{
          overscrollBehavior: "none",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div ref={contentRef} className="w-full">
          {/* Images grid */}
          <div
            className="relative w-full max-w-[1200px] mx-auto min-h-[150vh] pt-[60vh] pb-[40vh] images-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(20, 2%)",
              gridTemplateRows: `repeat(${ROWS * (infiniteScroll ? 2 : 1)}, 3%)`,
              justifyContent: "center",
              justifyItems: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {renderedImages.map((image, index) => {
              const { _copyIdx } = image;
              const [r1, c1, r2, c2] = image.gridArea.split("/").map(Number);
              const rowOffset = _copyIdx * ROWS;
              const gridArea = `${r1 + rowOffset}/${c1}/${r2 + rowOffset}/${c2}`;
              return (
                <img
                  key={`${index}-${image.url}`}
                  ref={(el) => (imagesRef.current[index] = el)}
                  src={image.url}
                  alt={`Scrolly image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-2xl"
                  style={{ gridArea }}
                  loading="lazy"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls overlay */}
      <div className="fixed bottom-8 right-8 bg-black/50 backdrop-blur-sm p-4 rounded-lg z-10 text-white text-sm">
        <div className="flex flex-col gap-2">
          <div>Speed: {speed}x</div>
          <div>Auto Scroll: {enableAutoScroll ? "ON" : "OFF"}</div>
          <div className="text-xs text-gray-400 mt-2">
            Scroll to pause auto-scroll
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConfigPanel = () => {
  const [config, setConfig] = useState({
    speed: 0.5,
    smoothness: 3.5,
    autoScrollSpeed: 8,
    enableAutoScroll: true,
    infiniteScroll: true,
  });

  return (
    <div className="w-full h-screen">
      <ScrollyImages {...config} />

      {/* Configuration panel */}
      <div className="fixed top-8 left-8 bg-black/70 backdrop-blur-md p-6 rounded-xl z-20 text-white max-w-xs">
        <h3 className="text-lg font-bold mb-4">Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">
              Parallax Speed: {config.speed.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.5"
              value={config.speed}
              onChange={(e) =>
                setConfig({ ...config, speed: parseFloat(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Smoothness: {config.smoothness.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={config.smoothness}
              onChange={(e) =>
                setConfig({ ...config, smoothness: parseFloat(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Auto Scroll Speed: {config.autoScrollSpeed.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.5"
              value={config.autoScrollSpeed}
              onChange={(e) =>
                setConfig({
                  ...config,
                  autoScrollSpeed: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoScroll"
              checked={config.enableAutoScroll}
              onChange={(e) =>
                setConfig({ ...config, enableAutoScroll: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="autoScroll" className="text-sm">
              Enable Auto Scroll
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="infiniteScroll"
              checked={config.infiniteScroll}
              onChange={(e) =>
                setConfig({ ...config, infiniteScroll: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="infiniteScroll" className="text-sm">
              Infinite Scroll (seamless)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

