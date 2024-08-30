const fs = require('fs');
const yaml = require('/home/ubuntu/.nvm/versions/node/v20.17.0/lib/node_modules/js-yaml');

try {
  const doc = yaml.load(fs.readFileSync('shipiru.yml', 'utf8'));
  console.log(JSON.stringify(doc, null, 2));
} catch (e) {
  console.error(e);
  process.exit(1);
}
