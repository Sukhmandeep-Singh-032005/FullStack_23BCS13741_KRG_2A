import { useState } from 'react';
import { loginUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Login failed. Account not found.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-purple-700 dark:text-pink-300 mb-6 text-center">
          Login to Your Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-purple-300 dark:border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-pink-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border border-purple-300 dark:border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-pink-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-md hover:scale-105 transition-transform"
        >
          Login
        </button>
      </form>
    </div>
  );
}
