const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: process.env.OPEN_AI_ORG_ID,
    apiKey: process.env.OPEN_AI_TEST_KEY,
});
const openai = new OpenAIApi(configuration);
// const response = async () => await openai.listEngines();

module.exports = openai;