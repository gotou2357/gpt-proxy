export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { message } = await req.json(); // ← Web標準RequestではOK

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

  const data = await response.json();

  return new Response(JSON.stringify({ text: data.choices[0].message.content }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
