const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log(envPath);
const KEY = "TOKEN_SECRET";

const isExist = fs.existsSync(envPath);
if(!isExist) {
  fs.writeFileSync(envPath,'', { flag: 'wx' });
}
const fileContent = fs.readFileSync(envPath);
const existsSecret = fileContent.indexOf(KEY) !== -1;
if(!existsSecret) {
  const token = crypto.randomBytes(64).toString('hex');
  fs.appendFileSync(envPath, [KEY, token].join('='));
}
console.log("DONE")
