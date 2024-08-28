// Alias for buildTableDepth that starts the recursive table building at a depth of 0
import { addColorToStats, RED } from "./add-color-to-stats.js";
import { sumCoverage } from "./sum-coverage.js";

export function buildTable(total, files, haveSummary) {
  return buildTableDepth(total, files, 0)
}

// Recursively builds the markdown table containing all code coverage statistics
function buildTableDepth(total, files, depth, haveSummary) {
  // Define our table string
  let table = "";

  // If depth hasn't been defined or is set to 0, set it to 1 to indicate the start
  if (typeof depth != "number" || depth <= 0) {
    depth = 1;

    // Set table header
    if (haveSummary) {
      table += `File|% Stmts|% Branch|% Funcs|% Lines|Uncovered Line #s
----|-------|--------|-------|-------|-----------------
`;
    } else {
      table += `File|% Lines|Uncovered Line #s
----|-------|-----------------
`;
    }
  }

  // If a total summary object has been provided, add the table header and total summary line
  // at the top of the table
  if (total) {
    const totalColored = addColorToStats(total);
    table += `![All files](https://img.shields.io/badge/All%20files-${ totalColored.statements.color }?style=for-the-badge)|![${ totalColored.statements.pct }](https://img.shields.io/badge/${ totalColored.statements.pct }-${ totalColored.statements.color }?style=for-the-badge)|![${ totalColored.branches.pct }](https://img.shields.io/badge/${ totalColored.branches.pct }-${ totalColored.branches.color }?style=for-the-badge)|![${ totalColored.functions.pct }](https://img.shields.io/badge/${ totalColored.functions.pct }-${ totalColored.functions.color }?style=for-the-badge)|![${ totalColored.lines.pct }](https://img.shields.io/badge/${ totalColored.lines.pct }-${ totalColored.lines.color }?style=for-the-badge)|
`;
  }

  // Iterate through each entry in the files/folders, generating a row in the table for each
  for (const fileKey in files) {
    // Checks to see if the key is a js file or a directory
    const isJsFileRe = /^.+\.[a-z0-9]+$/m;

    // If this is a js file, write a row that contains all summary statistics for the coverage
    // of the individual file including individual uncovered lines
    if (fileKey.match(isJsFileRe)) {
      // Fetches the summary statistics from the object
      const fileEntry = files[fileKey];

      // Computes the badge color for each column of the row based on the percent coverage
      const fileEntryColored = addColorToStats(fileEntry);

      // Adds space indentation to the filename in the first column based on the depth
      // of the recursion
      const indent = '&nbsp;'.repeat(depth * 2);

      // Generates individual red-colored badges for each range of uncovered lines
      let uncoveredLines = "";
      if (Array.isArray(fileEntry.uncovered) && fileEntry.uncovered.length > 0) {
        for (const line of fileEntry.uncovered) {
          const lineCharReplaced = line.replace("-", "--");
          uncoveredLines += `![${ line }](https://img.shields.io/badge/${ lineCharReplaced }-${ RED }?style=for-the-badge)&nbsp;`
        }
      }

      // Replaces special characters in the file name for adding to the badge URL
      const fileKeyCharsReplaced = fileKey.replace(" ", "_").replace("-", "--");

      // Generates the row for the file if we have a full summary
      if (haveSummary) {
        table += `${ indent }![${ fileKey }](https://img.shields.io/badge/${ fileKeyCharsReplaced }-${ fileEntryColored.statements.color }?style=for-the-badge)|![${ fileEntryColored.statements.pct }](https://img.shields.io/badge/${ fileEntryColored.statements.pct }-${ fileEntryColored.statements.color }?style=for-the-badge)|![${ fileEntryColored.branches.pct }](https://img.shields.io/badge/${ fileEntryColored.branches.pct }-${ fileEntryColored.branches.color }?style=for-the-badge)|![${ fileEntryColored.functions.pct }](https://img.shields.io/badge/${ fileEntryColored.functions.pct }-${ fileEntryColored.functions.color }?style=for-the-badge)|![${ fileEntryColored.lines.pct }](https://img.shields.io/badge/${ fileEntryColored.lines.pct }-${ fileEntryColored.lines.color }?style=for-the-badge)|${ uncoveredLines }
`;
      } else {
        table += `${ indent }![${ fileKey }](https://img.shields.io/badge/${ fileKeyCharsReplaced }-${ fileEntryColored.lines.color }?style=for-the-badge)|![${ fileEntryColored.lines.pct }](https://img.shields.io/badge/${ fileEntryColored.lines.pct }-${ fileEntryColored.lines.color }?style=for-the-badge)|${ uncoveredLines }
`;
      }
    } else {
      // Fetches all the files in the directory
      const fileEntry = files[fileKey];

      // Computes the sum of all code coverage statistics for all files in the directory
      const sums = sumCoverage(fileEntry, false);

      // Computes the badge color for each column of the row based on the percent coverage
      // of all files in the directory
      const sumsColored = addColorToStats(sums);

      // Adds space indentation to the directory name in the first column based on the depth
      // of the recursion
      const indent = '&nbsp;'.repeat(depth * 2);

      // Replaces special characters in the directory name for adding to the badge URL
      const fileKeyCharsReplaced = fileKey.replace(" ", "_").replace("-", "--");

      // Generates the row for the directory if we have a full summary
      if (haveSummary) {
        table += `${ indent }![${ fileKey }](https://img.shields.io/badge/${ fileKeyCharsReplaced }-${ sumsColored.statements.color }?style=for-the-badge)|![${ sumsColored.statements.pct }](https://img.shields.io/badge/${ sumsColored.statements.pct }-${ sumsColored.statements.color }?style=for-the-badge)|![${ sumsColored.branches.pct }](https://img.shields.io/badge/${ sumsColored.branches.pct }-${ sumsColored.branches.color }?style=for-the-badge)|![${ sumsColored.functions.pct }](https://img.shields.io/badge/${ sumsColored.functions.pct }-${ sumsColored.functions.color }?style=for-the-badge)|![${ sumsColored.lines.pct }](https://img.shields.io/badge/${ sumsColored.lines.pct }-${ sumsColored.lines.color }?style=for-the-badge)|
`;
      } else {
        table += `${ indent }![${ fileKey }](https://img.shields.io/badge/${ fileKeyCharsReplaced }-${ sumsColored.lines.color }?style=for-the-badge)|![${ sumsColored.lines.pct }](https://img.shields.io/badge/${ sumsColored.lines.pct }-${ sumsColored.lines.color }?style=for-the-badge)|
`;
      }

      // Recursively adds rows for each file in the directory
      table += buildTableDepth(null, fileEntry, depth + 1);
    }
  }

  return table;
}
