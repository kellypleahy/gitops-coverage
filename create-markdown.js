// Import modules required for reading files line-by-line
import * as fs from 'fs';
import * as mdcore from './create-markdown-core.js';
import * as process from 'node:process';

// Paths to the files we'll need to compute coverage summary
let jsonSummaryFilePath = process.env["GITOPS_COVERAGE_JSON_SUMMARY_FILE_PATH"];
if (!jsonSummaryFilePath) {
  jsonSummaryFilePath = "./coverage/coverage-summary.json";
}

let lcovInfoFilePath = process.env["GITOPS_COVERAGE_LCOV_INFO_FILE_PATH"];
if (!lcovInfoFilePath) {
  lcovInfoFilePath = "./coverage/lcov.info";
}

let projectPath = process.env["GITOPS_COVERAGE_PROJECT_PATH"];
if (!projectPath) {
  projectPath = process.cwd();
}
projectPath.replace(/\/+$/, "");

let outputFile = process.env["GITOPS_COVERAGE_OUTPUT_FILE"];

await new Promise((resolve, reject) => {
  async function inner() {
    const mdComment = await mdcore.createMarkdownCore(projectPath, jsonSummaryFilePath, lcovInfoFilePath);
    if (outputFile) {
      fs.writeFile(outputFile, mdComment, {}, err => {
        if (err) {
          reject(err);
        } else {
          console.log(`Successfully wrote gitops coverage markdown to ${outputFile}`);
          resolve();
        }
      });
    } else {
      console.log(mdComment);
      resolve();
    }
  }
  return inner();
});
