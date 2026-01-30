
import { CardMastery, Flashcard } from '../types';

const SRS_STORAGE_KEY = 'eduquest_srs_data';

// Simple string hash for unique card identification
const getCardId = (front: string) => {
  let hash = 0;
  for (let i = 0; i < front.length; i++) {
    hash = (hash << 5) - hash + front.charCodeAt(i);
    hash |= 0; 
  }
  return `card_${hash}`;
};

export const srsService = {
  getAllMastery: (): Record<string, CardMastery> => {
    const data = localStorage.getItem(SRS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  getCardMastery: (front: string): CardMastery => {
    const id = getCardId(front);
    const all = srsService.getAllMastery();
    return all[id] || { id, level: 0, nextReview: 0, lastInterval: 0 };
  },

  /**
   * Processes a card review
   * @param front The card question
   * @param mastered Whether the user got it right (true) or skipped/failed (false)
   */
  recordReview: (front: string, mastered: boolean): CardMastery => {
    const mastery = srsService.getCardMastery(front);
    const all = srsService.getAllMastery();
    
    if (mastered) {
      // Logic: Increase level, double interval
      mastery.level = Math.min(mastery.level + 1, 5);
      const days = mastery.level === 1 ? 1 : Math.pow(2, mastery.level) + Math.floor(Math.random() * 2);
      mastery.lastInterval = days;
      mastery.nextReview = Date.now() + days * 24 * 60 * 60 * 1000;
    } else {
      // Logic: Reset level to 0, reappears soon
      mastery.level = 0;
      mastery.lastInterval = 0;
      mastery.nextReview = Date.now(); // Due immediately
    }

    all[mastery.id] = mastery;
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(all));
    return mastery;
  }
};
