// The colors used to highlight green, orange, and red badges in the markdown
const GREEN = "147317";
const ORANGE = "c27d15";
export const RED = "c23815";

// Takes a summary stats object (composed typically of "statements", "branches", "functions",
// and "lines" keys) and computes the color each of those categories should have based on
// the percent coverage. It then adds the selected color as another key in the summary.
export function addColorToStats(stats) {
  const statsToProcess = ["statements", "branches", "functions", "lines"];

  for (const stat of statsToProcess) {
    if (stats[stat].pct >= 80) {
      stats[stat].color = GREEN;
    } else if (stats[stat].pct >= 50) {
      stats[stat].color = ORANGE;
    } else {
      stats[stat].color = RED;
    }
  }

  return stats;
}
