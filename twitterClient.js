// Twitter Client
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_CLIENT_ID,
  appSecret: process.env.TWITTER_CLIENT_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  bearerToken: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
});

const rwClient = client.readWrite;

module.exports = { rwClient, client };