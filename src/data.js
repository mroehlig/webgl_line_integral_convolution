import { ungzip } from "pako";
import Parser from "papaparse";

// Get the filename from the URL.
function getFilename(url) {
  return url.split('\\').pop().split('/').pop();
}

// Extract the width and height from the filename (e.g., data_150x150.csv.gz).
function getDimensions(filename) {
  let parts = filename.split('_')[1].split('.')[0].split('x');
  return {
    width: parseInt(parts[0]),
    height: parseInt(parts[1]),
  };
}

// Load the data from the given URL.
export function loadData(url, callback) {
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.arrayBuffer();
      }

      throw new Error("Could not load data from " + url);
    })
    .then((data) => {
      let inflated = ungzip(data, { 'to': 'string' });
      let parsed = Parser.parse(inflated, {
        dynamicTyping: true, // Convert strings to number or boolean.
        skipEmptyLines: true, // Empty lines are omitted.
      });

      // Get the filename from the URL.
      let filename = getFilename(url);

      // Extract the width and height from the filename.
      let dimensions = getDimensions(filename);

      // Call the callback with the data.
      callback(parsed.data, dimensions.width, dimensions.height);
    });
}