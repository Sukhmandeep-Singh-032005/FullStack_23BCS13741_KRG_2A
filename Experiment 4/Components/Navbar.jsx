import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  const getInitial = () => {
    return user?.email ? user.email.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md py-4 px-6 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-purple-600 dark:text-pink-300 tracking-wide"
        >
          Anime Verse
        </Link>

        {/* Navigation + Theme + User */}
        <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300 font-medium">
          <Link
            to="/"
            className="hover:text-purple-500 dark:hover:text-pink-400 transition"
          >
            Home
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                className="hover:text-purple-500 dark:hover:text-pink-400 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-purple-500 dark:hover:text-pink-400 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>

              <div
                className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md"
                title={user.email}
              >
                {getInitial()}
              </div>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-full border border-purple-300 dark:border-pink-300 hover:bg-purple-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>
    </nav>
  );
}
