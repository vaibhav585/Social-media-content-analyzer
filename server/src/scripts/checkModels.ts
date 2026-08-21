import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY || '';

async function run() {
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    process.exit(1);
  }

  console.log(`Checking models for key starting with: ${apiKey.substring(0, 5)}...`);
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There is no listModels on the standard Node SDK class directly, but we can make a direct fetch request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      console.error('Failed to list models. Status:', response.status);
      console.error('Response:', await response.text());
      return;
    }
    const data = await response.json();
    console.log('Available Models:');
    data.models.forEach((model: any) => {
      console.log(`- ${model.name} (Supported Methods: ${model.supportedGenerationMethods.join(', ')})`);
    });
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

run();
