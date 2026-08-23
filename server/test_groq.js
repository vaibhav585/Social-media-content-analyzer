require('dotenv').config({path: './.env'});
const Groq = require('groq-sdk');
async function run() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const models = await groq.models.list();
    console.log(models.data.map(m => m.id));
  } catch (e) {
    console.error(e.message);
  }
}
run();
