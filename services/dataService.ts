
import { UserAccount } from '../types';

const USER_KEY = 'eduquest_v2_user';
const LEADERBOARD_KEY = 'eduquest_v2_leaderboard';

export interface LeaderboardEntry {
  name: string;
  points: number;
  grade: string;
  photo: string;
  isUser?: boolean;
}

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { name: "Aarav Sharma", points: 2850, grade: "10", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" },
  { name: "Ishita Gupta", points: 2410, grade: "10", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita" },
  { name: "Kabir Singh", points: 1980, grade: "10", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir" },
  { name: "Priya Das", points: 1820, grade: "12", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  { name: "Rohan Varma", points: 1550, grade: "9", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" },
];

export const dataService = {
  // Simulating an asynchronous database save
  saveUser: async (user: UserAccount): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        dataService.updateLeaderboardSync(user);
        resolve();
      }, 300);
    });
  },

  getUser: async (): Promise<UserAccount | null> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(USER_KEY);
      resolve(data ? JSON.parse(data) : null);
    });
  },

  clearUser: async (): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(USER_KEY);
      resolve();
    });
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      let currentLeaderboard: LeaderboardEntry[] = data ? JSON.parse(data) : INITIAL_LEADERBOARD;
      
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        const user: UserAccount = JSON.parse(userData);
        currentLeaderboard = currentLeaderboard.filter(e => e.name !== user.name);
        currentLeaderboard.push({
          name: user.name,
          points: user.points,
          grade: user.grade,
          photo: user.photo || '',
          isUser: true
        });
      }

      const sorted = currentLeaderboard.sort((a, b) => b.points - a.points);
      resolve(sorted);
    });
  },

  updateLeaderboardSync: (user: UserAccount) => {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    let leaderboard: LeaderboardEntry[] = data ? JSON.parse(data) : INITIAL_LEADERBOARD;
    leaderboard = leaderboard.filter(e => e.name !== user.name);
    leaderboard.push({
      name: user.name,
      points: user.points,
      grade: user.grade,
      photo: user.photo || '',
      isUser: true
    });
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }
};
