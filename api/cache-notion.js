const fetch = require('node-fetch');
const { Octokit } = require('@octokit/rest');

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";
const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'datagreier';
const GITHUB_REPO = 'qgdata';
const FILE_PATH = 'tree/main/dbcache/data.json';
const PAGE_SIZE = 5; // Number of pages to fetch from Notion

async function fetchNotionData() {
  try {
    const notionUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    console.log('Fetching data from Notion API...');

    const pages = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore && pages.length < PAGE_SIZE) {
      const body = {};
      if (startCursor) {
        body.start_cursor = startCursor;
      }

      const notionResponse = await fetch(notionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!notionResponse.ok) {
        throw new Error('Failed to fetch data from Notion');
      }

      const data = await notionResponse.json();

      pages.push(...data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    console.log('Data received from Notion:', pages);

    await pushDataToGitHub(JSON.stringify(pages, null, 2));
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
