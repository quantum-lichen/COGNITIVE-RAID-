// Service to handle API calls to various LLM providers

export const callAPI = async (provider: string, apiKey: string, q: string): Promise<string | undefined> => {
  try {
    if (provider === 'claude') {
      // NOTE: Client-side calls to Anthropic often fail due to CORS. 
      // This assumes a proxy or appropriate browser environment.
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': apiKey, 
          'anthropic-version': '2023-06-01' 
        },
        body: JSON.stringify({ 
          model: 'claude-3-5-sonnet-20241022', 
          max_tokens: 1500, 
          messages: [{ role: 'user', content: q }] 
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return data.content?.[0]?.text;
    }
    
    if (provider === 'chatgpt') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: "You are a helpful assistant." },
            { role: 'user', content: q }
          ],
          max_tokens: 1500
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content;
    }

    if (provider === 'gemini') {
      // Using gemini-2.5-flash as the modern standard for fast inference
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: q }] }] })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (provider === 'grok') {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: q }],
          max_tokens: 1500
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content;
    }

  } catch (e: any) {
    console.error(`${provider} Error:`, e);
    throw new Error(`${provider.toUpperCase()}: ${e.message || 'Error'}`);
  }
};