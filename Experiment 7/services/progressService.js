import { db } from '../firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const saveProgress = async (userId, animeId, episode) => {
  const ref = doc(db, 'progress', `${userId}_${animeId}`);
  await setDoc(ref, { episode });
};

export const getProgress = async (userId, animeId) => {
  const ref = doc(db, 'progress', `${userId}_${animeId}`);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data().episode : 1;
};
