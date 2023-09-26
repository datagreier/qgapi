const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');

const NOTION_API_KEY = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
const NOTION_DATABASE_ID = "c68a45e247104d2c9099c729477cda69";
const REDIS_URL = "redis://quizguru-vercel:bNhwb7uv6qzZM18-n@redis-18451.c59.eu-west-1-2.ec2.cloud.redislabs.com:18451";

const client = redis.createClient(REDIS_URL);
const setAsync = promisify(client.set).bind(client);

async function cacheNotionDataToRedis() {
  try {
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
      console.error('Fetching data from Notion API...'); // Log to Vercel logs
      const notionResponse = await axios.post(
        notionUrl,
        startCursor ? { start_cursor: startCursor } : {},
        { headers }
      );
      console.error('Data received from Notion:', notionResponse.data); // Log to Vercel logs

      allData = allData.concat(notionResponse.data.results);
      
      hasNextPage = notionResponse.data.has_more;
      startCursor = notionResponse.data.next_cursor;
    }

    // Store the fetched data in Redis
    console.error('Storing fetched data in Redis...'); // Log to Vercel logs
    await setAsync('notionData', JSON.stringify(allData), 'EX', 60 * 60 * 24 * 7); // Cache for 7 days
    console.error('Data stored in Redis successfully'); // Log to Vercel logs
    
  } catch (error) {
    console.error('Error occurred:', error); // Log to Vercel logs

    // Add additional error handling logic here, if needed.
    // For example, you can check the type of error and take specific actions.
  } finally {
    // Close the Redis client when done
    client.quit();
  }
}

cacheNotionDataToRedis();
