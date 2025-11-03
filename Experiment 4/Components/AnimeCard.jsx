import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import WatchTrailer from './WatchTrailer';

export default function AnimeCard({ anime }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-purple-200 dark:border-pink-300 hover:shadow-xl transition-transform duration-300 flex flex-col justify-between"
      whileHover={{ scale: 1.03 }}
      style={{ minHeight: '400px' }}
    >
      <Link to={`/anime/${anime.mal_id}`}>
        <img
          src={anime.images.jpg.image_url}
          alt={anime.title}
          className="w-full h-64 object-cover"
        />
      </Link>

      <div className="p-4 flex flex-col justify-between h-full">
        <Link to={`/anime/${anime.mal_id}`}>
          <h2 className="text-xl font-semibold text-purple-700 dark:text-pink-300 line-clamp-2 mb-4 text-center">
            {anime.title}
          </h2>
        </Link>

        <div className="mt-auto flex justify-center">
          <WatchTrailer title={anime.title} />
        </div>
      </div>
    </motion.div>
  );
}
