const fetch = require('node-fetch');
const fs = require('fs/promises');

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";
const FILE_PATH = 'qgdata/dbcache/data.json';

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

    // Write the fetched data to the data.json file
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
    console.log('Data written to data.json successfully');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

fetchNotionData();
