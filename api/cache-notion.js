const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";
const GITHUB_TOKEN = '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'; // Replace with your GitHub token
const GITHUB_OWNER = 'datagreier'; // Replace with your GitHub username
const GITHUB_REPO = 'qgdata'; // Replace with the target GitHub repository
const FILE_PATH = 'dbcache/data.json';

async function fetchNotionData() {
  try {
    // Initialize Notion API URL and headers
    const notionUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    // Fetch data from Notion API
    console.log('Fetching data from Notion API...');
    const notionResponse = await fetch(notionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    if (!notionResponse.ok) {
      throw new Error('Failed to fetch data from Notion');
    }

    const data = await notionResponse.json();
    console.log('Data received from Notion:', data);

    // Write the fetched data to a local file
    const localFilePath = path.join(__dirname, FILE_PATH);
    await fs.writeFile(localFilePath, JSON.stringify(data, null, 2));
    console.log(`Data written to ${localFilePath} successfully`);

    // Push the local file to the target GitHub repository
    await pushDataToGitHub(localFilePath);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

async function pushDataToGitHub(filePath) {
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Read the file contents
    const fileContents = await fs.readFile(filePath, 'utf8');

    // Create or update a file in the target repository
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: FILE_PATH,
      message: 'Update data from Notion',
      content: Buffer.from(fileContents).toString('base64'),
      branch: 'main', // Replace with the target branch name
    });

    console.log(`Data pushed to the ${GITHUB_REPO} repository successfully`);
  } catch (error) {
    console.error('Error pushing data to GitHub:', error);
  }
}

fetchNotionData();
