import * as core from '@actions/core';
import * as github from '@actions/github';
import * as mdcore from './create-markdown-core.js';
import * as fs from 'fs';

try {
  const projectPath = core.getInput('project-path');
  const jsonSummaryFilePath = core.getInput('json-summary-file-path');
  const lcovInfoFilePath = core.getInput('lcov-info-file-path');
  const outputFilePath = core.getInput('output-file-path');

  let result = await mdcore.createMarkdownCore(projectPath, jsonSummaryFilePath, lcovInfoFilePath);
  core.setOutput('coverage', result);

  await writeFileAsync(outputFilePath, result);
} catch(error) {
  core.setFailed(error.message);
}

function writeFileAsync(fileName, contents) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, contents, {}, err => {
      if (err)
        reject(err);
      else
        resolve();
    })
  })
}
