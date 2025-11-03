import { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';

export default function AnimeList() {
  const [animeList, setAnimeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const endpoint = searchTerm.trim()
          ? `https://api.jikan.moe/v4/anime?q=${searchTerm}`
          : `https://api.jikan.moe/v4/top/anime`;

        const response = await fetch(endpoint);
        const data = await response.json();
        setAnimeList(data.data || []);
      } catch (error) {
        console.error('Failed to fetch anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [searchTerm]);

  return (
    <section className="py-12 px-4">
      <div className="flex justify-center mb-12">
        <input
          type="text"
          placeholder="Search your favorite anime..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-3xl px-6 py-4 text-lg rounded-full border border-purple-300 shadow-md focus:outline-none focus:ring-4 focus:ring-pink-300 transition duration-300 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center text-purple-500 text-xl animate-pulse">
          Loading anime...
        </div>
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {animeList.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic mt-20">
          No anime found. Try searching for something else!
        </div>
      )}
    </section>
  );
}
