const axios = require('axios');

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', 'https://real-walkthroughs-117669.framer.app'); // URL for CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Added Caching

    const notionUrl = "https://api.notion.com/v1/databases/c68a45e247104d2c9099c729477cda69/query";
    const apiKey = "secret_L5EkN7Il9rEm9QfPNKRx8Lca5Q6m0sfyvK9yoYMtw9Z";
    
    const response = await axios.post(
      notionUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error accessing Notion API: ", error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
};
