export default async function handler(req) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'あなたは写メ日記を書くアシスタントです。' },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'OpenAI API error' }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();

  return new Response(JSON.stringify({ text: data.choices[0].message.content }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
