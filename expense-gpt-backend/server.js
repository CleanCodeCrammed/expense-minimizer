const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, expenses } = req.body;

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
${Object.entries(expenses.data).map(([type, list]) => {
    return `- ${type}:\n${list.map(e => `  • ${e.name}: ${e.amount}`).join('\n')}`;
  }).join('\n')}
`;

  try {
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

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'OpenAI request failed.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));