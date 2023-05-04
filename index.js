const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const { messageBuilder } = require("./messageBuilder");
const { rwClient, client } = require("./twitterClient");
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
          // Here goes the tweet
          return message;
      })
      .catch(error => {
        console.log("errrrr -------------", error.message);
        // In case of error, tweet a random message
        return "Something went wrong, I am not working properly, sorry :(";
      });
  } catch (error) {
    console.error("Error while asking OpenAI: ", error.message);
    return "Something went wrong, I am not working properly, sorry";
  }
};

// main function
async function main() {

  console.log("main client", client.search, "rwClient v2--------", rwClient.v2,);

  // Twitter handle
  const twitterHandle = `${process.env.APP_NAME.toLowerCase()}`

  // Set up stream
  const stream = await rwClient.v2.searchStream("statuses/filter", {
    track: twitterHandle,
  });

  console.log("stream========", stream);

  // Listen for mentions
  stream.on("data", async tweet => {
    // Check if mention
    if (tweet.in_reply_to_status_id_str) {
      // Check if you already replied to the mention
      const replies = await client.v2.searchAll({
        query: `to:${tweet.user.screen_name} from:${twitterHandle}`,
        max_results: 100,
        tweet_fields: "conversation_id"
      });

      if (
        replies.data.some(
          reply => reply.conversation_id === tweet.conversation_id
        )
      ) {
        console.log("Already replied to mention:", tweet.id);
        return;
      }

      // Reply to the mention

      // Ask openai
      const question = tweet.text
        .replace(new RegExp(`@${twitterHandle}`, "gi"), "")
        .replace(/\B@[a-z0-9_-]+/gi, "")
        .replace(/\B#[a-z0-9_-]+/gi, "")
        .replace(/\Bhttps?:\/\/\S+/gi, "")
        .replace(/\Bhttp?:\/\/\S+/gi, "")
        .replace(/\Bwww\.\S+/gi, "")

      console.log("question ****************", question);

      const replyFromAI = await ask(question);

      console.log("question ****************", replyFromAI);

      const reply = await client.v1.reply(tweet.id_str, {
        status: `@${tweet.user.screen_name} ${replyFromAI}`
      });

      console.log("Replied to mention:", reply.id_str);
    }
  });

  stream.on('error', error => {
    console.error("Error while tweeting: ", error);
  });
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
