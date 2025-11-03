import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <motion.div
      className="bg-gradient-to-r from-purple-500 via-pink-400 to-rose-300 text-white px-6 py-16 rounded-xl shadow-lg text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-6xl font-extrabold tracking-wide drop-shadow-md">Anime Verse</h1>
      <p className="mt-6 text-2xl italic font-light">Stream your favorite anime and track your journey through beautiful worlds.</p>
    </motion.div>
  );
}
