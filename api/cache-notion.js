// api/cache-notion.js
const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";
const REDIS_URL = "redis://quizguru-vercel:IIuSfHkcVpvomp5xmseznUHjqXAaxn71@redis-18451.c59.eu-west-1-2.ec2.cloud.redislabs.com:18451";

module.exports = async (req, res) => {
  try {
    // Initialize Redis client and promisify set method
    const client = redis.createClient(REDIS_URL);
    
    console.log('Attempting to connect to Redis...');
    client.on('connect', function() {
        console.log('Connected to Redis');
    });
    client.on('error', function(err) {
        console.error('Redis error:', err);
    });
    
    const setAsync = promisify(client.set).bind(client);

    // Initialize Notion API URL and headers
    const notionUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    };
    
    let hasNextPage = true;
    let startCursor = null;
    let allData = [];

    // Paginate through all pages in Notion database
    while (hasNextPage) {
      console.log('Fetching data from Notion API...');
      const notionResponse = await axios.post(
        notionUrl,
        startCursor ? { start_cursor: startCursor } : {},
        { headers }
      );
      console.log('Data received from Notion:', notionResponse.data);

      allData = allData.concat(notionResponse.data.results);
      
      hasNextPage = notionResponse.data.has_more;
      startCursor = notionResponse.data.next_cursor;
    }

    // Store the fetched data in Redis
    console.log('Storing fetched data in Redis...');
    await setAsync('notionData', JSON.stringify(allData), 'EX', 60 * 60 * 24 * 7); // Cache for 7 days
    console.log('Data stored in Redis successfully');
    res.status(200).send('Data fetched from Notion and stored in Redis successfully!');
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};
