const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3333;

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/', (req, res) => {
  const payload = req.body;

  // Extract repository and branch information
  const repoUrl = payload.repository.ssh_url;
  const branch = payload.ref.split('/').pop(); // Extracts the branch name
  const repoName = payload.repository.name;

  console.log(`Received push on branch ${branch} for repository ${repoName}`);

  const scriptPath = path.resolve(process.env.HOME, 'shipiru', 'scripts', 'pipeline.sh');
  console.log(`Will execute build script: ${scriptPath} ${repoUrl} ${branch}`);

  // Run the build.sh script with the full path
  exec(`${scriptPath} ${repoUrl} ${branch}`, (err, stdout, stderr) => {

    if (err) {
      console.error(`Error executing script: ${err}`);
    }
    console.log(`Script output: ${stdout}`);
    console.error(`Script error output: ${stderr}`);
  });
  res.status(200).send('Build triggered successfully');
});

app.listen(PORT, () => {
  console.log(`Webhook listener running on port ${PORT}`);
});
