const fetch = require('node-fetch');
const fs = require('fs/promises');
const { DateTime } = require('luxon'); // You may need to install the luxon library

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";

const GITHUB_TOKEN = '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';
const GITHUB_REPO = 'datagreier/qgdata';
const FILE_PATH = 'qgdata/dbcache/data.json';
const COMMIT_MESSAGE = 'Update data from Notion';

async function fetchNotionData() {
  try {
    // Initialize Notion API URL and headers
    const notionUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    let hasNextPage = true;
    let startCursor = null;
    let allData = [];

    // Paginate through all pages in Notion database
    while (hasNextPage) {
      console.log('Fetching data from Notion API...');
      const notionResponse = await fetch(notionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(startCursor ? { start_cursor: startCursor } : {}),
      });

      if (!notionResponse.ok) {
        throw new Error('Failed to fetch data from Notion');
      }

      const data = await notionResponse.json();
      console.log('Data received from Notion:', data);

      allData = allData.concat(data.results);

      hasNextPage = data.has_more;
      startCursor = data.next_cursor;
    }

    // Format your Notion data as needed (e.g., JSON)
    const formattedData = {
      // Your formatted data here
    };

    // Backup the previous data.json file with a timestamp
    await backupOldData();

    // Write the new data.json file
    await writeDataToFile(formattedData);

    console.log('Data pushed to GitHub successfully');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

async function backupOldData() {
  try {
    const timestamp = DateTime.now().toFormat('yyyyMMddHHmmss');
    const oldFilePath = `qgdata/dbcache/data_${timestamp}.json`;
    await fs.copyFile(FILE_PATH, oldFilePath);
    console.log(`Previous data.json file backed up as ${oldFilePath}`);
  } catch (error) {
    console.error('Error backing up previous data:', error);
  }
}

async function writeDataToFile(data) {
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
    console.log('New data.json file written successfully');
  } catch (error) {
    console.error('Error writing new data.json:', error);
  }
}

fetchNotionData();
