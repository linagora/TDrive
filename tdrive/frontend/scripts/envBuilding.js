var exec = require('child_process').exec;
const fs = require('fs');

var args = process.argv.slice(2);
const oldVersionDetails = args[0];
const newVersionDetails = args[1];
const newVersion = args[2];

const relativeEnvironment = './src/app/environment/version.ts';
const relativeIndex = './public/index.html';

exec('cat ' + relativeEnvironment, (err, stdout, stderr) => {
  stdout = stdout.replace("'" + oldVersionDetails + "'", "'" + newVersionDetails + "'");
  stdout = stdout.replace("'" + oldVersionDetails.substr(0, 3) + "'", "'" + newVersion + "'");
  fs.writeFileSync(relativeEnvironment, stdout);
});

exec('cat ' + relativeIndex, (err, stdout, stderr) => {
  stdout = stdout.replace(oldVersionDetails, newVersionDetails);
  fs.writeFileSync(relativeIndex, stdout);
});
