// /api/generate.js

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. POST以外は拒否
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. 環境変数の確認
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set in environment variables' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. リクエストBodyのパース
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON format in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userMessage = body.message;
  if (!userMessage || typeof userMessage !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid "message" in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. OpenAI APIへのリクエスト構築
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage },
    ],
  };

  let openaiResponse;
  try {
    openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to reach OpenAI API', details: error.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. ステータスコード確認
  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    return new Response(JSON.stringify({ error: 'OpenAI API error', details: errorText }), {
      status: openaiResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }


    // 6. OpenAIのレスポンス取得
  let data;
  try {
    data = await openaiResponse.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to parse OpenAI response JSON' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 7. choicesがあるか確認
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    return new Response(JSON.stringify({ error: 'OpenAI response missing expected structure', raw: data }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const reply = data.choices[0].message.content;

  // 8. 正常レスポンスを返す
  return new Response(JSON.stringify({ text: reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

