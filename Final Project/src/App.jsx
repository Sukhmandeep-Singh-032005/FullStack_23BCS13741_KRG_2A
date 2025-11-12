import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, updateDoc } from 'firebase/firestore';
import { PlayCircle, ChevronRight, Bookmark, X, Loader, CornerUpLeft } from 'lucide-react';

// --- FIREBASE/FIRESTORE SETUP ---

// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Mock Anime Data (Simulating a database table/external API)
// Using placeholder images and popular anime titles for a professional look.
const MOCK_ANIME_DATA = [
  { id: 1, title: 'Attack Titan', genre: 'Action, Fantasy', episodes: 88, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Attack+Titan', featured: true, description: "Humanity's fight for survival against massive, man-eating Titans.", long_title: 'Attack on Titan: The Final Chapter' },
  { id: 2, title: 'Space Cowboy', genre: 'Sci-Fi, Action', episodes: 26, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Space+Cowboy', featured: false, description: 'A futuristic crew of bounty hunters chasing criminals across the solar system.' },
  { id: 3, title: 'Ninja Saga', genre: 'Adventure, Shonen', episodes: 500, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Ninja+Saga', featured: false, description: 'A young ninja seeks recognition from his peers and dreams of becoming the Hokage.' },
  { id: 4, title: 'Aged Sorcerer', genre: 'Fantasy, Drama', episodes: 24, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Aged+Sorcerer', featured: false, description: 'A powerful sorcerer goes on a journey of self-discovery after centuries of solitude.' },
  { id: 5, title: 'Dragon Balls Z', genre: 'Action, Adventure', episodes: 291, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Dragon+Balls+Z', featured: false, description: 'Fighters defend the Earth against various villains using superhuman strength.' },
  { id: 6, title: 'Cyberpunk Edgers', genre: 'Cyberpunk, Thriller', episodes: 10, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Cyberpunk+Edgers', featured: false, description: 'A young street kid tries to survive in a technology-obsessed city.' },
  { id: 7, title: 'Magical School', genre: 'Slice of Life, Magic', episodes: 13, poster: 'https://placehold.co/300x450/1f2937/ffffff?text=Magical+School', featured: false, description: 'Students learning to harness their magic powers in a secluded academy.' },
];

const FEATURED_ANIME = MOCK_ANIME_DATA.find(a => a.featured);

// Utility function to convert milliseconds to a formatted time string (MM:SS)
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- COMPONENTS ---

/**
 * Animated Card for an anime title in the horizontal rows.
 */
const AnimeCard = ({ anime, progress, onClick }) => {
  const watchProgress = progress?.current_time_ms || 0;
  const lastWatchedEpisode = progress?.last_watched_episode || 0;
  const isWatching = lastWatchedEpisode > 0 && lastWatchedEpisode < anime.episodes;
  const percentage = isWatching ? ((watchProgress / (180000)) * 100) : 0; // Assume 3 min runtime for simplicity in mock data

  return (
    <div
      onClick={() => onClick(anime)}
      className="relative flex-shrink-0 w-48 h-72 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out transform hover:scale-110 hover:shadow-2xl hover:z-20 group bg-gray-900"
    >
      <img
        src={anime.poster}
        alt={anime.title}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
        onError={(e) => e.target.src = 'https://placehold.co/300x450/000000/fff?text=Poster+Missing'}
      />
      
      {/* Play/Details Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
        <PlayCircle className="w-12 h-12 text-red-500 hover:text-red-400 transition-colors" fill="currentColor" />
      </div>

      {/* Progress Bar and Status */}
      {(lastWatchedEpisode > 0 || isWatching) && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 backdrop-blur-sm">
          <p className="text-xs font-semibold text-white truncate">
            {isWatching ? `S1 E${lastWatchedEpisode}: ${formatTime(watchProgress)}` : 'Completed'}
          </p>
          {isWatching && (
            <div className="mt-1 h-1 bg-gray-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};


/**
 * Horizontal scrolling list of anime titles.
 */
const AnimeRow = ({ title, animes, userProgress, onSelectAnime }) => {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300; // Scroll by a fixed amount
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-8 relative group">
      <h2 className="text-2xl font-bold text-white mb-4 ml-6 md:ml-12">{title}</h2>
      
      {/* Scroll Buttons (visible on hover/desktop) */}
      <div className="hidden lg:group-hover:block absolute top-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-10">
        <button
          onClick={(e) => { e.stopPropagation(); scroll('left'); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-12 bg-black/50 hover:bg-black/70 transition-opacity flex items-center justify-center pointer-events-auto rounded-r-lg"
          aria-label="Scroll Left"
        >
          <ChevronRight className="w-8 h-8 text-white transform rotate-180" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); scroll('right'); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-12 bg-black/50 hover:bg-black/70 transition-opacity flex items-center justify-center pointer-events-auto rounded-l-lg"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 px-6 md:px-12 pb-6 overflow-x-scroll scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {animes.map(anime => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            progress={userProgress[anime.id]}
            onClick={onSelectAnime}
          />
        ))}
      </div>
      
      {/* Custom Scrollbar Styling (simulated for Tailwind compatibility) */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};


/**
 * Featured Banner component (Netflix-style hero section).
 */
const FeaturedAnime = ({ anime, progress, onSelectAnime }) => {
  const lastWatched = progress?.last_watched_episode || 0;
  const isWatching = lastWatched > 0;
  
  const progressText = isWatching
    ? `Continue S1 E${lastWatched} (Time: ${formatTime(progress.current_time_ms)})`
    : `Start Watching Season 1`;

  return (
    <div className="relative h-[60vh] md:h-[80vh] bg-cover bg-center"
         style={{ backgroundImage: `url(https://placehold.co/1920x800/000000/ffffff?text=${encodeURIComponent(anime.long_title || anime.title)})` }}>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 text-white max-w-4xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-lg animate-fade-in-up">
          {anime.long_title || anime.title}
        </h1>
        <p className="text-base md:text-lg mb-6 max-w-lg drop-shadow-md line-clamp-3">
          {anime.description}
        </p>

        <div className="flex space-x-4">
          <button
            onClick={() => onSelectAnime(anime)}
            className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-full text-lg shadow-xl hover:bg-red-700 transition-colors duration-300 transform hover:scale-105"
          >
            <PlayCircle className="w-6 h-6 mr-2" />
            {isWatching ? 'Continue Watching' : 'Play Now'}
          </button>
          <button
            className="flex items-center px-6 py-3 bg-gray-600/70 text-white font-semibold rounded-full text-lg shadow-xl hover:bg-gray-700/90 transition-colors duration-300"
          >
            <Bookmark className="w-6 h-6 mr-2" />
            More Info
          </button>
        </div>

        {isWatching && (
          <p className="mt-4 text-sm font-medium text-gray-300">
            {progressText}
          </p>
        )}
      </div>
    </div>
  );
};


/**
 * Detailed view (Modal) for watching an anime and tracking progress.
 */
const AnimeDetails = ({ anime, progress, userId, db, onClose }) => {
  const [currentEpisode, setCurrentEpisode] = useState(progress?.last_watched_episode || 1);
  const [currentTimeMs, setCurrentTimeMs] = useState(progress?.current_time_ms || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Simulate episode duration (3 minutes for mock data)
  const EPISODE_DURATION_MS = 180000;

  useEffect(() => {
    // Set initial values based on current progress
    setCurrentEpisode(progress?.last_watched_episode || 1);
    setCurrentTimeMs(progress?.current_time_ms || 0);
  }, [progress]);

  // Firestore update function
  const saveProgress = useCallback(async (ep, time) => {
    if (!userId || !db) return;
    setIsLoading(true);
    setStatusMessage('Saving progress...');
    
    // Path: /artifacts/{appId}/users/{userId}/user_progress/anime_{anime.id}
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/user_progress`, `anime_${anime.id}`);

    try {
      await setDoc(docRef, {
        anime_id: anime.id,
        user_id: userId,
        last_watched_episode: ep,
        current_time_ms: time,
        updated_at: new Date().toISOString(),
      }, { merge: true });
      setStatusMessage('Progress saved successfully!');
    } catch (error) {
      console.error("Error saving progress:", error);
      setStatusMessage('Error saving progress.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  }, [userId, db, anime.id]);

  // Simulate watching the episode (increment time every 5 seconds)
  useEffect(() => {
    let interval;
    if (currentTimeMs < EPISODE_DURATION_MS) {
      interval = setInterval(() => {
        setCurrentTimeMs(prevTime => {
          const newTime = prevTime + 5000;
          if (newTime >= EPISODE_DURATION_MS) {
            // Episode finished
            const nextEpisode = currentEpisode + 1;
            
            if (nextEpisode > anime.episodes) {
              // Series completed
              saveProgress(anime.episodes, EPISODE_DURATION_MS); 
            } else {
              // Move to next episode, reset time
              saveProgress(nextEpisode, 0); 
            }
            clearInterval(interval);
            return EPISODE_DURATION_MS;
          }
          
          // Auto-save every 30 seconds (30000ms)
          if (newTime % 30000 === 0) {
              saveProgress(currentEpisode, newTime);
          }
          
          return newTime;
        });
      }, 5000);
    }
    
    return () => clearInterval(interval); // Cleanup interval
  }, [currentTimeMs, currentEpisode, anime.episodes, saveProgress]);

  // Manual actions
  const handleNextEpisode = () => {
    const nextEpisode = currentEpisode + 1;
    if (nextEpisode <= anime.episodes) {
      setCurrentEpisode(nextEpisode);
      setCurrentTimeMs(0);
      saveProgress(nextEpisode, 0);
    }
  };
  
  const handleGoBack = () => {
    const newTime = Math.max(0, currentTimeMs - 10000);
    setCurrentTimeMs(newTime);
    saveProgress(currentEpisode, newTime);
  };
  
  const handleJumpForward = () => {
    const newTime = Math.min(EPISODE_DURATION_MS, currentTimeMs + 30000);
    setCurrentTimeMs(newTime);
    saveProgress(currentEpisode, newTime);
  };
  
  const percentWatched = (currentTimeMs / EPISODE_DURATION_MS) * 100;
  
  const isCompleted = currentEpisode >= anime.episodes && currentTimeMs >= EPISODE_DURATION_MS;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-gray-900 rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-red-600 rounded-full text-white z-50 hover:bg-red-700 transition-colors"
          aria-label="Close Viewer"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Video Player Area */}
        <div className="aspect-video relative bg-black">
          <img 
            src={`https://placehold.co/1000x562/0f172a/f97316?text=S1+E${currentEpisode}+-+Watching`}
            alt="Video Placeholder" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
            <div className="absolute top-4 left-4 text-2xl font-bold">
              {anime.title} - E{currentEpisode}
            </div>
            
            {/* Playback Controls */}
            <div className="mt-4 flex items-center space-x-4 bg-black/70 p-3 rounded-xl">
              <button 
                onClick={handleGoBack}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors transform hover:scale-110"
                title="Go Back 10s"
              >
                <CornerUpLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 h-2 bg-gray-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, percentWatched)}%` }}
                />
              </div>

              <span className="text-sm font-mono">{formatTime(currentTimeMs)} / {formatTime(EPISODE_DURATION_MS)}</span>
              
              <button 
                onClick={handleJumpForward}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors transform hover:scale-110"
                title="Jump Forward 30s"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button 
                onClick={handleNextEpisode} 
                disabled={currentEpisode >= anime.episodes}
                className={`p-2 rounded-full transition-colors transform hover:scale-110 ${currentEpisode >= anime.episodes ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                title="Next Episode"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Status Message */}
            {(isLoading || statusMessage) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center p-3 rounded-lg bg-gray-800 text-white shadow-xl">
                {isLoading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
                {statusMessage}
              </div>
            )}
            
            {isCompleted && (
               <div className="absolute inset-0 bg-black/90 flex items-center justify-center flex-col">
                  <h2 className="text-4xl font-extrabold text-green-400 mb-4">Series Completed!</h2>
                  <p className="text-xl text-gray-300">Thanks for watching **{anime.title}** on Anime Verse!</p>
                  <button onClick={onClose} className="mt-8 px-6 py-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                    Back to Home
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Area (Scrollable) */}
        <div className="p-6 md:p-10 text-white max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-800">
            <h3 className="text-xl font-bold mb-2">Anime Information</h3>
            <p className="text-gray-400 text-sm">{anime.description}</p>
            <div className="mt-4 flex space-x-6 text-sm">
                <p><span className="font-semibold text-red-400">Total Episodes:</span> {anime.episodes}</p>
                <p><span className="font-semibold text-red-400">Genre:</span> {anime.genre}</p>
            </div>
        </div>

      </div>
    </div>
  );
};


/**
 * Main Application Component
 */
const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProgress, setUserProgress] = useState({}); // { animeId: { last_watched_episode, current_time_ms, ... } }
  const [selectedAnime, setSelectedAnime] = useState(null);

  // 1. Firebase Initialization and Auth Handling
  useEffect(() => {
    if (Object.keys(firebaseConfig).length === 0) {
      console.error("Firebase config is missing.");
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      setDb(dbInstance);
      setAuth(authInstance);

      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // Fallback to anonymous sign-in if no token, though token is usually provided
          try {
            await signInAnonymously(authInstance);
          } catch (error) {
            console.error("Anonymous sign-in failed:", error);
          }
        }
        setIsAuthReady(true);
      });

      // Sign in with custom token if available
      if (initialAuthToken) {
        signInWithCustomToken(authInstance, initialAuthToken)
          .catch(error => console.error("Custom token sign-in failed:", error));
      }

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setIsAuthReady(true);
    }
  }, []);

  // 2. Firestore Listener for User Progress
  useEffect(() => {
    if (!db || !userId) return;

    // Define the collection path for private user data
    const progressCollectionPath = `artifacts/${appId}/users/${userId}/user_progress`;
    const q = query(collection(db, progressCollectionPath));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newProgress = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Extract anime ID from the document name (e.g., 'anime_1' -> 1)
        const animeId = parseInt(doc.id.split('_')[1], 10);
        newProgress[animeId] = data;
      });
      setUserProgress(newProgress);
      console.log("User progress loaded:", newProgress);
    }, (error) => {
      console.error("Error listening to user progress:", error);
    });

    return () => unsubscribe(); // Clean up listener
  }, [db, userId]);


  // 3. Filter and Group Anime
  const watchingAnime = MOCK_ANIME_DATA
    .filter(anime => {
      const p = userProgress[anime.id];
      return p && p.last_watched_episode > 0 && p.last_watched_episode < anime.episodes;
    })
    .sort((a, b) => {
      // Sort by latest update time (simulated by last watched time for mock)
      const progA = userProgress[a.id].updated_at || '';
      const progB = userProgress[b.id].updated_at || '';
      return new Date(progB) - new Date(progA);
    });

  const topPicksAnime = MOCK_ANIME_DATA
    .filter(a => a.id !== FEATURED_ANIME.id && watchingAnime.every(w => w.id !== a.id))
    .slice(0, 7);
    
  const actionAnime = MOCK_ANIME_DATA
    .filter(a => a.id !== FEATURED_ANIME.id && a.genre.includes('Action') && watchingAnime.every(w => w.id !== a.id))
    .slice(0, 7);

  
  // --- RENDERING LOGIC ---

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Loader className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-xl">Connecting to Anime Verse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-gray-100 overflow-x-hidden">
      <style>{`
        /* Custom Tailwind font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
      
      {/* 4. Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md p-4 md:p-6 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center space-x-6">
          <h1 className="text-3xl font-black text-red-600 tracking-wider">
            ANIME <span className="text-white">VERSE</span>
          </h1>
          <nav className="hidden md:flex space-x-4 text-sm font-medium">
            <a href="#" className="hover:text-red-600 transition-colors">Home</a>
            <a href="#" className="hover:text-red-600 transition-colors">Series</a>
            <a href="#" className="hover:text-red-600 transition-colors">Movies</a>
            <a href="#" className="hover:text-red-600 transition-colors">New & Popular</a>
          </nav>
        </div>
        <div className="text-xs md:text-sm bg-gray-800 p-2 rounded-full px-4 font-mono shadow-inner">
          <span className="text-red-400 font-bold">User ID:</span> {userId}
        </div>
      </header>

      <main className="pt-20">
        {/* Featured Banner */}
        {FEATURED_ANIME && (
          <FeaturedAnime 
            anime={FEATURED_ANIME} 
            progress={userProgress[FEATURED_ANIME.id]}
            onSelectAnime={setSelectedAnime}
          />
        )}
        
        <div className="relative -mt-20 z-30">
          {/* Continue Watching Row */}
          {watchingAnime.length > 0 && (
            <AnimeRow
              title="Continue Watching"
              animes={watchingAnime}
              userProgress={userProgress}
              onSelectAnime={setSelectedAnime}
            />
          )}

          {/* Top Picks Row */}
          <AnimeRow
            title="Top Picks for You"
            animes={topPicksAnime}
            userProgress={userProgress}
            onSelectAnime={setSelectedAnime}
          />

          {/* Action Anime Row */}
          <AnimeRow
            title="Action & Adventure"
            animes={actionAnime}
            userProgress={userProgress}
            onSelectAnime={setSelectedAnime}
          />
          
        </div>
      </main>

      {/* 5. Anime Details/Player Modal */}
      {selectedAnime && (
        <AnimeDetails 
          anime={selectedAnime} 
          progress={userProgress[selectedAnime.id]} 
          userId={userId} 
          db={db}
          onClose={() => setSelectedAnime(null)}
        />
      )}
      
      {/* Style for custom scrollbar (used in AnimeDetails modal) */}
      <style>{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #1f2937;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #dc2626; /* red-600 */
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #1f2937; /* gray-800 */
        }
      `}</style>

    </div>
  );
};

export default App;
