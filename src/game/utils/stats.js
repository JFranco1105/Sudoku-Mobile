export const StatsManager = {
    getStats() {
        const stats = localStorage.getItem('sudoku_stats');
        return stats ? JSON.parse(stats) : {
            easy: { played: 0, won: 0, bestTime: null },
            medium: { played: 0, won: 0, bestTime: null },
            hard: { played: 0, won: 0, bestTime: null }
        };
    },

    saveWin(difficulty, seconds) {
        const stats = this.getStats();
        const diff = stats[difficulty] || stats.easy;

        diff.played += 1;
        diff.won += 1;
        if (!diff.bestTime || seconds < diff.bestTime) {
            diff.bestTime = seconds;
        }

        localStorage.setItem('sudoku_stats', JSON.stringify(stats));
    }
};