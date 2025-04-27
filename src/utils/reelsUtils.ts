import { Topic } from "@/types/api";

type StorageKeyType =  'brainder_discover_history' | 'brainder_learn_history';

export const getStoredReels = (storageKey: StorageKeyType): Topic[] => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return [];
  
  try {
    const storedReelsRaw = localStorage.getItem(storageKey);
    if (storedReelsRaw) {
      return JSON.parse(storedReelsRaw);
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  
  return [];
};

export const setStoredReels = (storageKey: StorageKeyType, topics: Topic[]): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(topics));
  } catch (error) {
    console.error('Error saving reels history in localStorage:', error);
  }
};