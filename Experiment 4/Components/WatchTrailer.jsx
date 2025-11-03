import { useEffect, useState } from "react";
import axios from "axios";

export default function WatchTrailer({ title }) {
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!title) return;

      try {
        const apiKey = import.meta.env.VITE_YT_API;
        const query = `${title} official anime trailer`;

        const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            key: apiKey,
            part: "snippet",
            q: query,
            maxResults: 1,
            type: "video",
            videoEmbeddable: true,
          },
        });

        const videoId = data?.items?.[0]?.id?.videoId;
        if (videoId) {
          setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
        } else {
          setVideoUrl(null);
        }
      } catch (error) {
        console.error("YouTube API Error:", error);
        setVideoUrl(null);
      }
    };

    fetchTrailer();
  }, [title]);

  const handleClick = () => {
    if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " anime trailer")}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all animate-pulse"
      >
        🎬 Watch Trailer
      </button>
    </div>
  );
}
