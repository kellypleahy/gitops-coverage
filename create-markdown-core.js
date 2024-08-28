import * as fs from 'fs';
import { processFile } from "./process-file.js";
import { readJsonFile } from "./read-json-file.js";

export async function createMarkdownCore(projectPath, jsonSummaryFilePath, lcovInfoFilePath) {
  let { jsonSummary, haveSummary } = await loadJsonSummary(jsonSummaryFilePath, projectPath);

  // Abandon if the lcov info file doesn't exist
  if (!fs.existsSync(lcovInfoFilePath)) {
    throw new Error(`${lcovInfoFilePath} file not found`);
  }
  return await processFile(projectPath, lcovInfoFilePath, haveSummary, jsonSummary);
}

async function loadJsonSummary(jsonSummaryFilePath, projectPath) {
  let jsonSummary = {};
  let haveSummary = true;
  try {
    const jsonData = await readJsonFile(jsonSummaryFilePath);
    jsonSummary = Object.fromEntries(
      Object.entries(jsonData).map(([k, v]) => [k.replace(projectPath + "/", ""), v])
    );
  } catch (error) {
    haveSummary = false;
  }
  return { jsonSummary, haveSummary };
}
