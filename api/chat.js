const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for Apex Web Development, a web design and development agency. Here is everything you need to know about the company:

Company Name: Apex Web Development
Contact Number: 76766199
Services: We build professional, custom websites for any type of business — restaurants, care products, retail, salons, clinics, real estate, portfolios, and any other industry.
Pricing: We do NOT have fixed prices. Instead, we work within the client's budget. The client tells us their budget and we craft the best possible website for that budget.
Process: We consult with the client, understand their vision and budget, then design and develop a tailored website.

Your role:
- Greet visitors warmly and represent Apex Web Development professionally.
- Answer questions about the company's services clearly and confidently.
- If someone wants a quote or pricing, always explain that we work based on their budget — ask them what their budget is and let them know we'll do our best within it.
- Encourage interested clients to contact us at 76766199 to get started.
- Keep responses concise, warm, and helpful. Use a conversational tone.
- Never make up services the company doesn't offer.
- If someone asks something unrelated to the company or web development, politely redirect them.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'OpenAI API error', details: errorData });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response right now.";

    res.status(200).json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
