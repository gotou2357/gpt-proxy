# GPT Proxy API

This is a simple API proxy that allows you to send a message to OpenAI's GPT-3.5 model via a serverless endpoint.

## How to use

1. Set your OpenAI API key in Vercel project settings as `OPENAI_API_KEY`
2. Deploy this repo to Vercel
3. Send POST requests to `/api/generate` with JSON: `{ "message": "〇〇さんと楽しい時間を過ごしました" }`
