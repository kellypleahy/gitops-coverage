import * as core from '@actions/core';
import * as github from '@actions/github';
import * as mdcore from './create-markdown-core.js'

try {
  const projectPath = core.getInput('project-path');
  const jsonSummaryFilePath = core.getInput('json-summary-file-path');
  const lcovInfoFilePath = core.getInput('lcov-info-file-path');

  let result = await mdcore.createMarkdownCore(projectPath, jsonSummaryFilePath, lcovInfoFilePath);
  core.setOutput('markdown', result);
} catch(error) {
  core.setFailed(error.message);
}
