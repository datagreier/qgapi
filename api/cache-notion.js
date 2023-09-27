const fetch = require('node-fetch');
const { Octokit } = require('@octokit/rest');

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";
const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'datagreier';
const GITHUB_REPO = 'qgdata';
const FILE_PATH = 'tree/main/dbcache/data.json';

// Define the maximum number of pages/lines to load
const MAX_PAGES = 5; 

async function fetchNotionData() {
  try {
    const notionUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    console.log('Fetching data from Notion API...');

    let hasMore = true;
    let startCursor;
    let pages = 0;
    let results = [];

    while (hasMore && pages < MAX_PAGES) {
      const body = startCursor ? { start_cursor: startCursor } : {};
      const notionResponse = await fetch(notionUrl, { method: 'POST', headers, body: JSON.stringify(body) });

      if (!notionResponse.ok) {
        throw new Error('Failed to fetch data from Notion');
      }

      const data = await notionResponse.json();
      console.log(`Page ${pages + 1} received from Notion. Number of results: ${data.results.length}`);
      results = results.concat(data.results);

      hasMore = data.has_more;
      startCursor = data.next_cursor;
      pages++;
    }

    console.log(`Total pages received from Notion: ${pages}`);
    await pushDataToGitHub(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

async function pushDataToGitHub(fileContents) {
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: FILE_PATH,
      message: 'Update data from Notion',
      content: Buffer.from(fileContents).toString('base64'),
      branch: 'main',
    });

    console.log(`Data pushed to the ${GITHUB_REPO} repository successfully`);
  } catch (error) {
    console.error('Error pushing data to GitHub:', error);
  }
}

fetchNotionData();
