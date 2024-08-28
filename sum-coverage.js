// Computes the sum of all coverage statistics for all files in the object
// of tested files
export function sumCoverage(obj, recurse) {
  let summary = {
    lines: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    functions: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    statements: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    branches: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    }
  };
  for (const entryKey in obj) {
    const isJsFileRe = /^.+\.[a-z0-9]+$/m;
    if (entryKey.match(isJsFileRe)) {
      let entry = obj[entryKey];
      if (entry.lines) {
        if (typeof entry.lines.total == "number") {
          summary.lines.total += entry.lines.total;
        }
        if (typeof entry.lines.covered == "number") {
          summary.lines.covered += entry.lines.covered;
        }
        if (typeof entry.lines.skipped == "number") {
          summary.lines.skipped += entry.lines.skipped;
        }
      }
      if (entry.functions) {
        if (typeof entry.functions.total == "number") {
          summary.functions.total += entry.functions.total;
        }
        if (typeof entry.functions.covered == "number") {
          summary.functions.covered += entry.functions.covered;
        }
        if (typeof entry.functions.skipped == "number") {
          summary.functions.skipped += entry.functions.skipped;
        }
      }
      if (entry.statements) {
        if (typeof entry.statements.total == "number") {
          summary.statements.total += entry.statements.total;
        }
        if (typeof entry.statements.covered == "number") {
          summary.statements.covered += entry.statements.covered;
        }
        if (typeof entry.statements.skipped == "number") {
          summary.statements.skipped += entry.statements.skipped;
        }
      }
      if (entry.branches) {
        if (typeof entry.branches.total == "number") {
          summary.branches.total += entry.branches.total;
        }
        if (typeof entry.branches.covered == "number") {
          summary.branches.covered += entry.branches.covered;
        }
        if (typeof entry.branches.skipped == "number") {
          summary.branches.skipped += entry.branches.skipped;
        }
      }
    } else if (!entryKey.match(isJsFileRe) && entryKey !== "total" && recurse) {
      const recursedSummary = sumCoverage(obj[entryKey], recurse);
      summary.lines.total += recursedSummary.lines.total;
      summary.lines.covered += recursedSummary.lines.covered;
      summary.lines.skipped += recursedSummary.lines.skipped;
      summary.functions.total += recursedSummary.functions.total;
      summary.functions.covered += recursedSummary.functions.covered;
      summary.functions.skipped += recursedSummary.functions.skipped;
      summary.statements.total += recursedSummary.statements.total;
      summary.statements.covered += recursedSummary.statements.covered;
      summary.statements.skipped += recursedSummary.statements.skipped
      summary.branches.total += recursedSummary.branches.total;
      summary.branches.covered += recursedSummary.branches.covered;
      summary.branches.skipped += recursedSummary.branches.skipped;
    }
  }
  summary.lines.pct = summary.lines.total == 0 ? 0 : Math.round(((summary.lines.covered / summary.lines.total) + Number.EPSILON) * 10000) / 100;
  summary.functions.pct = summary.functions.total == 0 ? 0 : Math.round(((summary.functions.covered / summary.functions.total) + Number.EPSILON) * 10000) / 100;
  summary.statements.pct = summary.statements.total == 0 ? 0 : Math.round(((summary.statements.covered / summary.statements.total) + Number.EPSILON) * 10000) / 100;
  summary.branches.pct = summary.branches.total == 0 ? 0 : Math.round(((summary.branches.covered / summary.branches.total) + Number.EPSILON) * 10000) / 100;
  return summary;
}
