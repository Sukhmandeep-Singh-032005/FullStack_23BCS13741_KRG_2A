import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { saveProgress, getProgress } from '../services/progressService';
import WatchTrailer from '../components/WatchTrailer';

export default function AnimeDetail() {
  const { id } = useParams(); // MAL ID
  const { user } = useAuth();

  const [anime, setAnime] = useState(null);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const res = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
        if (!res.data?.data) throw new Error('Anime not found');
        setAnime(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load anime details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchStreamingLinks = async () => {
      try {
        const res = await axios.get(`https://hianime-api.vercel.app/anime/${id}`);
        setEpisodes(res.data.episodes || []);
      } catch (err) {
        console.error('Streaming links not found:', err);
      }
    };

    fetchAnimeDetails();
    fetchStreamingLinks();

    if (user) {
      getProgress(user.uid, id).then((saved) => {
        if (saved && saved > 0) setEpisode(saved);
      });
    }
  }, [id, user]);

  const handleSave = () => {
    if (user && episode >= 1) {
      saveProgress(user.uid, id, episode);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-purple-500 text-xl animate-pulse">
        Loading anime details...
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="text-center py-20 text-red-500 text-lg">
        {error || 'Anime not found.'}
      </div>
    );
  }

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-purple-700 dark:text-pink-300 mb-8 text-center">
        {anime.title}
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <img
          src={anime.images.jpg.image_url}
          alt={anime.title}
          className="w-full max-w-md rounded-lg shadow-lg"
        />
        <div className="w-full max-w-xl">
          <WatchTrailer title={anime.title} />
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify mb-8">
        {anime.synopsis}
      </p>

      {/* 🔗 Streaming Links */}
      {episodes.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-purple-600 dark:text-pink-400 mb-4">
            Watch Episodes:
          </h2>
          <ul className="space-y-2">
            {episodes.map((ep) => (
              <li key={ep.id}>
                <a
                  href={ep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:underline"
                >
                  ▶️ Episode {ep.number}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 italic mt-6">
          No streaming links available for this anime.
        </p>
      )}

      {/* 📝 Resume Progress */}
      {user && (
        <div className="mt-8">
          <label className="block mb-2 text-lg font-medium text-purple-600 dark:text-pink-300">
            Resume Episode:
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              value={episode}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setEpisode(value);
              }}
              className="border border-purple-300 dark:border-pink-300 p-2 rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-pink-400"
            />
            <button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white px-4 py-2 rounded-md transition"
            >
              Save Progress
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
