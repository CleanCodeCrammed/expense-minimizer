const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/chat', (req, res) => {
  res.status(200).send('ExpenseMinimizerGPT backend is running.');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, expenses } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing message' });
    }
    if (!expenses || typeof expenses !== 'object') {
      return res.status(400).json({ error: 'Invalid or missing expenses' });
    }

    const formattedExpenses = Object.entries(expenses.data || {}).map(([type, list]) => {
      const items = list.map(e => `  • ${e.name}: ${e.amount}`).join('\n');
      return `- ${type}:\n${items}`;
    }).join('\n');

    const prompt = `
You are ExpenseMinimizerGPT. Based on the user's current monthly expenses, help them optimize their budget.

If asked, do one or more of the following:
- Suggest expenses to remove or reduce.
- Recommend better alternatives and explain your reasoning.
- Propose smart purchases or investments based on emotional/time cost patterns.

Be critical and helpful. Only act when prompted.

USER MESSAGE: ${message}
CURRENT MONTH: ${expenses.month}
EXPENSES:
${formattedExpenses}
`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error('OpenAI API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'AI service error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});