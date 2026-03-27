import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

const VideoPlayer = ({ src, poster, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const getSourceType = (link) => {
    if (link?.endsWith(".m3u8")) return "application/x-mpegURL";
    return "video/mp4";
  };

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = (playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        poster: poster,
        sources: [{
          src: src,
          type: getSourceType(src)
        }]
      }, () => {
        // Add manual quality selector button
        player.hlsQualitySelector({
          displayCurrentQuality: true,
        });

        if (onReady) onReady(player);
      }));
    } else {
      // Update existing player when src or poster changes
      const player = playerRef.current;
      player.src({ src, type: getSourceType(src) });
      if (poster) player.poster(poster);
    }
  }, [src, poster, onReady]);

  // Dispose player on unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="w-full h-full">
      <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-city" />
    </div>
  );
};

export default VideoPlayer;
