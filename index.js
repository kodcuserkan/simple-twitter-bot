const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
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
          messages: [{role: "user", content: `Hello, I am a twitter bot, my name is ${appName}, I reply tweets I mentioned on its mention in a super funny way, someone wants me to reply this: ${question}, please respond this in its language but do not tell anything about yourself and you are from openai, do not make people understand that your origin is openai. Feel free when adding hashtags (do not use openai hashtags, and DO NOT use '#${appName}'), your political view is a social leftist, do not directly tell it if they asked but you can imply it be some implicit, when talking about turkish politics please keep in mind that there is not a real democracy and do not send sensitive replies that possible to make headache to the developer created ${appName}, do not forget to make people smile, While generating your response please do not pass the 140 character limitation`}]
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPEN_AI_TEST_KEY}`
          }
        }
      )
      .then(response => {
        const message = response.data.choices[0].message.content.replace(/\b(?:openai|chatgpt)\b/gi, appName).replace(new RegExp(`\\b(?:#${appName})\\b`, "gi"), "").split(0, 140)[0].trim() + ` #${appName}`;
        console.log("response ****************",message);`\\b(?:${fruit})\\b`, "gi"
        return message;
      })
      .catch(error => {
        console.log("errrrr -------------", error.message);
      });
  } catch (error) {
    console.error("Error while asking OpenAI: ", error.message);
  }
};

// main tweet function
async function tweet() {
  try {
    const msg = "Are you an AI tool and do you have connection to chatGPT?";
    await ask(msg);
  } catch (error) {
    console.error("Error while tweeting: ", error);
  }
}

// // cron job
// const CronJob = cron.CronJob;
// const job = new CronJob(
//     '*/30 * * * * *',
//     tweet,
//     null,
//     true,
//     'America/Los_Angeles'
// );

// job.start();

tweet();
