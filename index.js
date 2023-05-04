const dotenv = require('dotenv');
dotenv.config();
const rwClient = require('./twitterClient');
const cron = require('cron');

// main tweet function
async function tweet() {
  try {    
    // Get USD / Turkish Lira exchange rate
    const usdTry = await rwClient.v2.get('tweets/search/recent', {
      query: 'usd try',
      max_results: 1,
      tweet: {
        fields: ['created_at', 'text']
      }
    });
   

    // Get bitcoin/USD exchange rate
    const btcUsd = await rwClient.v2.get('tweets/search/recent', {
      query: 'btc usd',
      max_results: 1,
      tweet: {
        fields: ['created_at', 'text']
      }
    });

    const msg = `USD/TRY: ${usdTry.data[0].text} \nBTC/USD: ${btcUsd.data[0].text}`;

    rwClient.v2.tweet(msg);
    console.log('Tweet sent: ', msg);
  } catch (error) {
    console.error('Error while tweeting: ', error);
  }
}

// cron job
const CronJob = cron.CronJob;
const job = new CronJob(
    '*/30 * * * * *',
    tweet,
    null,
    true,
    'America/Los_Angeles'
);

job.start();
