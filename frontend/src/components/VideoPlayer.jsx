import React, { useEffect, useRef, useState, useCallback } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

const VideoPlayer = ({ src, poster, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState("Auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const getSourceType = (link) => {
    if (link?.endsWith(".m3u8")) return "application/x-mpegURL";
    return "video/mp4";
  };

  const updateQualityLevels = useCallback((player) => {
    try {
      const qualityLevelsPlugin = player.qualityLevels?.();
      if (qualityLevelsPlugin) {
        const levels = [];
        for (let i = 0; i < qualityLevelsPlugin.length; i++) {
          const level = qualityLevelsPlugin[i];
          levels.push({
            index: i,
            height: level.height || 0,
            label: level.height ? `${level.height}p` : `Level ${i}`
          });
        }
        levels.sort((a, b) => b.height - a.height);
        // Add Auto option
        setQualityLevels([{ index: -1, height: 0, label: "Auto" }, ...levels]);
      }
    } catch (e) {
      console.log("Quality levels not available");
    }
  }, []);

  const handleQualityChange = useCallback((level) => {
    const player = playerRef.current;
    if (!player) return;
    
    try {
      const qualityLevelsPlugin = player.qualityLevels?.();
      if (qualityLevelsPlugin) {
        for (let i = 0; i < qualityLevelsPlugin.length; i++) {
          if (level.index === -1) {
            // Auto - enable all levels
            qualityLevelsPlugin[i].enabled = true;
          } else {
            // Manual - only enable matching level
            qualityLevelsPlugin[i].enabled = (i === level.index);
          }
        }
      }
      
      // Also use the plugin's built-in method
      if (level.index === -1) {
        player.hls?.currentLevel(-1); // Auto
      } else {
        player.hls?.currentLevel(level.index);
      }
      
      setCurrentQuality(level.label);
      setShowQualityMenu(false);
    } catch (e) {
      console.log("Quality change not supported");
    }
  }, []);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = (playerRef.current = videojs(
        videoElement,
        {
          autoplay: false,
          controls: true,
          responsive: true,
          fluid: true,
          poster: poster,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          sources: [
            {
              src: src,
              type: getSourceType(src),
            },
          ],
          controlBar: {
            children: [
              "playToggle",
              "volumePanel",
              "currentTimeDisplay",
              "timeDivider",
              "durationDisplay",
              "progressControl",
              "playbackRateMenuButton",
              "qualitySelector",
              "fullscreenToggle",
            ],
          },
        },
        () => {
          // Initialize quality selector plugin
          player.hlsQualitySelector({
            displayCurrentQuality: true,
          });

          // Get quality levels after metadata loads
          player.on("loadedmetadata", () => {
            updateQualityLevels(player);
          });

          // Update current quality display
          player.on("hlsLevelChanged", (event) => {
            const levels = player.qualityLevels?.();
            if (levels && levels.length > 0) {
              const currentLevel = levels[event.detail.level];
              if (currentLevel) {
                setCurrentQuality(currentLevel.height ? `${currentLevel.height}p` : "Auto");
              }
            }
          });

          if (onReady) onReady(player);
        },
      ));
    } else {
      const player = playerRef.current;
      player.src({ src, type: getSourceType(src) });
      if (poster) player.poster(poster);
      setQualityLevels([]);
      setCurrentQuality("Auto");
    }
  }, [src, poster, onReady, updateQualityLevels]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.quality-menu-container')) {
        setShowQualityMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div data-vjs-player className="w-full h-full relative">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-theme-city"
      />
      
      {/* Custom Quality Selector Button */}
      {qualityLevels.length > 1 && (
        <div className="quality-menu-container absolute top-0 right-0 z-50" style={{ top: '10px', right: '60px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQualityMenu(!showQualityMenu);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-all hover:bg-black/50"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.6)', 
              color: '#fff' 
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
            <span className="text-xs">{currentQuality}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ transform: showQualityMenu ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
          
          {/* Quality Menu Dropdown */}
          {showQualityMenu && (
            <div 
              className="absolute rounded-lg overflow-hidden shadow-lg"
              style={{ 
                bottom: '40px', 
                right: '0',
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                minWidth: '120px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {qualityLevels.map((level) => (
                <button
                  key={level.index}
                  onClick={() => handleQualityChange(level)}
                  className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/10"
                  style={{ 
                    color: currentQuality === level.label ? '#ff0000' : '#fff',
                    backgroundColor: currentQuality === level.label ? 'rgba(255,0,0,0.1)' : 'transparent'
                  }}
                >
                  {level.label}
                  {currentQuality === level.label && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
