import * as fs from "fs";

/**
 * @param {string} fileName
 * @returns {Promise<object>}
 */
export async function readJsonFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, "utf8", (err, data) => {
      if (err)
        reject(err);
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  })
}
