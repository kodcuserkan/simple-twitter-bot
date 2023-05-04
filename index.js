const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const { messageBuilder } = require("./messageBuilder");
const rwClient = require("./twitterClient");
const cron = require("cron");
const openai = require("./openai");

// Say something to openai
const ask = async question => {
  
  const appName = process.env.APP_NAME;
  try {
    axios
      .post(
        process.env.AI_URL,
        {
          model: process.env.APP_MODEL,
          messages: [
            {
              role: "user",
              content: messageBuilder(appName, question)
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPEN_AI_TEST_KEY}`
          }
        }
      )
      .then(response => {
        const message =
          response.data.choices[0].message.content
            .replace(/\b(?:openai|chatgpt)\b/gi, appName)
            .replace(new RegExp(" #\\b" + appName + "\\b", "gi"), "")
            .slice(0, 275)
            .trim() + ` #${appName}`;
        console.warn("response ****************", message);
        // Here goes the tweet
        // rwClient.tweet(message);
      })
      .catch(error => {
        console.log("errrrr -------------", error.message);
        // In case of error, tweet a random message
        // rwClient.tweet("Something went wrong, I am not working properly, sorry :(");
      });
  } catch (error) {
    console.error("Error while asking OpenAI: ", error.message);
  }
};

// main function
async function main() {
  try {
    const msg = "Twitter botu nedir nasıl çalışır";
    await ask(msg);
  } catch (error) {
    console.error("Error while tweeting: ", error);
  }
}

// // cron job
// const CronJob = cron.CronJob;
// const job = new CronJob(
//     '*/30 * * * * *',
//     main,
//     null,
//     true,
//     'America/Los_Angeles'
// );

// job.start();

main();
