import { buildTable } from "./build-table.js";
import * as fs from "fs";
import * as readline from "readline";

function processLine(line, jsonSummary, lineTracking, projectPath, haveSummary) {
  // Regexes for the identifying the type of line
  const reSF = /^SF:(.+)$/m;
  const reLF = /^LF:(\d+)$/m;
  const reDAUncovered = /^DA:(\d+),0$/m;
  const reDACovered = /^DA:(\d+),1$/m;
  const filenameMatches = line.match(reSF);
  const lineCountMatches = line.match(reLF);
  const uncoveredMatches = line.match(reDAUncovered);
  const coveredMatches = line.match(reDACovered);

  // If this is a filename line, record the name of the file being analyzed
  let filename = lineTracking.filename;
  if (filenameMatches && filenameMatches.length === 2) {
    filename = lineTracking.filename = filenameMatches[1].replace(projectPath + "/", "");

    // If we were not given a JSON summary, generate a blank one to add to
    if (!jsonSummary[filename]) {
      jsonSummary[filename] = {};
    }
    if (!jsonSummary[filename].lines) {
      jsonSummary[filename].lines = {
        total: 0,
        covered: 0,
        skipped: 0,
        pct: 0
      };
    }
    if (!jsonSummary[filename].functions) {
      jsonSummary[filename].functions = {
        total: 0,
        covered: 0,
        skipped: 0,
        pct: 0
      };
    }
    if (!jsonSummary[filename].statements) {
      jsonSummary[filename].statements = {
        total: 0,
        covered: 0,
        skipped: 0,
        pct: 0
      };
    }
    if (!jsonSummary[filename].branches) {
      jsonSummary[filename].branches = {
        total: 0,
        covered: 0,
        skipped: 0,
        pct: 0
      };
    }
  }
    // If this is a line count line, record the total line count if
  // we were not given a JSON summary
  else if (lineCountMatches && lineCountMatches.length === 2 && !haveSummary) {
    jsonSummary[filename].lines.total = parseInt(lineCountMatches[1]);
    jsonSummary[filename].lines.pct = jsonSummary[filename].lines.total === 0 ? 0 : Math.round(((jsonSummary[filename].lines.covered / jsonSummary[filename].lines.total) + Number.EPSILON) * 10000) / 100;
  }
    // If this is a line identifying a covered line of code, record an additional covered
  // line if we were not given a JSON summary
  else if (coveredMatches && coveredMatches.length === 2 && !haveSummary) {
    jsonSummary[filename].lines.covered += 1;
  }
    // If this is a line identifying that a line of code is uncovered and we are
  // not currently recording a range of uncovered lines, begin the range recording
  else if (uncoveredMatches && uncoveredMatches.length === 2 && !lineTracking.isRecordingUncovered) {
    lineTracking.isRecordingUncovered = true;
    lineTracking.uncoveredBeginning = +uncoveredMatches[1];
    lineTracking.uncoveredEnd = +uncoveredMatches[1];
  }
    // If this is a line identifying that a line of code is uncovered and we are
  // currently recording a range of uncovered lines, update the end-point of that range
  else if (uncoveredMatches && uncoveredMatches.length === 2 && lineTracking.isRecordingUncovered) {
    lineTracking.uncoveredEnd = +uncoveredMatches[1];
  }
    // If this is a line identifying that a line of code is covered and we are currently
  // recording a range of uncovered lines, record the end of that range
  else if (!uncoveredMatches && lineTracking.isRecordingUncovered) {
    let uncoveredString = `${ lineTracking.uncoveredBeginning }`;
    if (lineTracking.uncoveredEnd !== lineTracking.uncoveredBeginning) {
      uncoveredString += `-${ lineTracking.uncoveredEnd }`;
    }
    if (!jsonSummary[filename].uncovered) {
      jsonSummary[filename].uncovered = [];
    }
    jsonSummary[filename].uncovered.push(uncoveredString);
    lineTracking.isRecordingUncovered = false;
  }
}

function finishFile(jsonSummary, haveSummary, resolve) {
  // This reorganizes the results from a flat listing of files into a hierarchial listing.
  // Individual files in the root remain at the top-level, each directory and sub-directory
  // is all at the top level, with the individual files in those directories listed within
  // them. This keep a maximum depth of two.
  let dividedJsonSummary = {};
  for (const filePath in jsonSummary) {
    if (filePath === "total") {
      dividedJsonSummary[filePath] = jsonSummary[filePath];
    } else {
      const pathSlices = filePath.split("/");
      const pathWithoutFile = pathSlices.slice(0, -1).join("/");

      if (!dividedJsonSummary[pathWithoutFile]) {
        dividedJsonSummary[pathWithoutFile] = {};
      }
      dividedJsonSummary[pathWithoutFile][pathSlices[pathSlices.length - 1]] = jsonSummary[filePath];
    }
  }

  // Divide the summary into the total summary and the individual file/folder summaries
  const { total: totalSummary, ...filesSummary } = dividedJsonSummary;

  // Build the Markdown table containing all summarizing information
  const table = buildTable(totalSummary, filesSummary, haveSummary);

  // Build the complete Markdown comment with the table inside
  const mdComment = `Testing has completed, a summary of the code coverage results is provided below.

<details>

<summary>Code coverage summary</summary>

${ table }
</details>
`;

  resolve(mdComment);
}

export async function processFile(projectPath, lcovInfoFilePath, haveSummary, jsonSummary) {
  // These globals are used to record the file currently being read in the lcov file,
  // as well as the beginning and the end of the uncovered lines mentioned
  let lineTracking = {
    filename: null,
    isRecordingUncovered: false,
    uncoveredBeginning: 0,
    uncoveredEnd: 0,
  }

  return new Promise((resolve, reject) => {
    // Open a line-by-line read of the lcov file
    const fileStream = fs.createReadStream(lcovInfoFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    // For each line in the file, check if it's either:
    // - A line identifying the file being analyzed (prefix: SF)
    // - A line identifying a line of code and whether or not it was covered (prefix: DA)
    rl.on("line", (line) => {
      processLine(line, jsonSummary, lineTracking, projectPath, haveSummary);
    });

    // Build the markdown comment that will contain the code coverage results after
    // the lcov file reading and analysis has completed
    rl.on("close", () => {
      finishFile(jsonSummary, haveSummary, resolve);
    });

    rl.on("error", (err) => {
      reject(`Error reading the file: ${ err.message }`);
    });
  })
}
