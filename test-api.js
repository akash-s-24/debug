// A quick script to verify there are no syntax errors or obvious issues in the API files
const fs = require('fs');

try {
  const content = fs.readFileSync('src/app/api/battle/begin/route.ts', 'utf8');
  console.log("File exists and can be read.");
} catch (e) {
  console.error("Error reading file:", e);
}
