import axios from 'axios';

export const fetchAnime = async (query) => {
  try {
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}`);
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch anime:', err);
    return [];
  }
};
