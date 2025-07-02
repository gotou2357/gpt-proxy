export default async function handler(req) {
  const { message } = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
    const error = await response.text();
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    return new Response(JSON.stringify({ error: 'No choices returned from OpenAI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ text: data.choices[0].message.content }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
