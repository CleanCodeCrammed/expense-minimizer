import React, { useState, useEffect } from 'react';
import './App.css';

const expenseTypes = ['Monetary', 'Time', 'Emotional/Mental'];
const typeUnits = {
  Monetary: '($)',
  Time: '(hours)',
  'Emotional/Mental': '(units)'
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function App() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [selectedType, setSelectedType] = useState(expenseTypes[0]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(month));
    if (saved) {
      setExpensesByMonth(prev => ({ ...prev, [month]: JSON.parse(saved) }));
    }

    const savedChats = localStorage.getItem('chatMessages');
    if (savedChats) {
      setChatMessages(JSON.parse(savedChats));
    } else {
      setChatMessages([{
        user: '',
        bot: `Hi, I’m ExpenseMinimizerGPT, your budgeting assistant. I don’t act unless asked — you can ask me to analyze your current expenses, suggest what to cut, suggest affordable alternatives, or even recommend useful investments (e.g., an ergonomic chair if you’re logging back pain). I’m here to help — just ask!`
      }]);
    }
  }, [month]);

  useEffect(() => {
    localStorage.setItem(storageKey(month), JSON.stringify(expensesByMonth[month] || {}));
  }, [expensesByMonth, month]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  function storageKey(m) {
    return `expenses_${m}`;
  }

  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function handleAddExpense() {
    const name = prompt('Enter expense name:');
    if (!name) return;
    const amt = parseFloat(prompt('Enter amount:'));
    if (isNaN(amt)) {
      alert('Invalid number');
      return;
    }

    setExpensesByMonth(prev => {
      const monthData = { ...(prev[month] || {}) };
      const list = [...(monthData[selectedType] || [])];
      list.push({ name, amount: amt });
      monthData[selectedType] = list;
      return { ...prev, [month]: monthData };
    });
  }

  function handleRemoveExpense(i) {
    setExpensesByMonth(prev => {
      const monthData = { ...(prev[month] || {}) };
      const list = [...(monthData[selectedType] || [])];
      list.splice(i, 1);
      monthData[selectedType] = list;
      return { ...prev, [month]: monthData };
    });
  }

  function formatAmount(amount) {
    if (selectedType === 'Monetary') return `$${amount}`;
    if (selectedType === 'Time') return `${amount} hours`;
    return `${amount} units`;
  }

  function getTotal() {
    const list = expensesByMonth[month]?.[selectedType] || [];
    return list.reduce((sum, e) => sum + e.amount, 0);
  }

  // === CHAT LOGIC WITH CONTEXT ===
  async function handleSendMessage() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();

    const userExpenses = expensesByMonth[month] || {};

    const payload = {
      message: userMsg,
      expenses: {
        month,
        data: userExpenses
      }
    };

    setChatMessages(prev => [...prev, { user: userMsg, bot: '...' }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const botMsg = data.choices?.[0]?.message?.content || 'No response from AI.';
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].bot = botMsg;
        return updated;
      });
    } catch {
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].bot = 'Error contacting the AI.';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    setChatMessages([]);
    localStorage.removeItem('chatMessages');
  }

  function generateMonthOptions() {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(i);
      const y = date.getFullYear();
      const m = String(i + 1).padStart(2, '0');
      const label = `${monthNames[i]} ${y}`;
      options.push({ key: `${y}-${m}`, label });
    }
    return options;
  }

  const currentExpenses = expensesByMonth[month]?.[selectedType] || [];

  return (
    <div className="app-layout">
      <div className="main-section">
        <h1>ExpenseMinimizer</h1>

        <select value={month} onChange={e => setMonth(e.target.value)}>
          {generateMonthOptions().map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>

        <div className="tabs">
          {expenseTypes.map(type => (
            <button
              key={type}
              className={selectedType === type ? 'active' : ''}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="header-row">
          <h2>{selectedType} Expenses {typeUnits[selectedType]}</h2>
          <div className="total-display">
            Total: {getTotal()} {typeUnits[selectedType]}
          </div>
        </div>

        <button onClick={handleAddExpense} className="add-btn">Add Expense</button>
        <ul className="expense-list">
          {currentExpenses.map((e, i) => (
            <li key={i}>
              {e.name} — {formatAmount(e.amount)}
              <button onClick={() => handleRemoveExpense(i)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-section">
        <h2>ExpenseMinimizerGPT</h2>
        <div className="chat-box">
          {chatMessages.map((msg, i) => (
            <div key={i} className="chat-message">
              {msg.user && <><strong>You:</strong> {msg.user}<br /></>}
              <strong>Bot:</strong> {msg.bot}
            </div>
          ))}
        </div>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Ask the assistant..."
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
        <button onClick={handleClearChat}>Clear Chat</button>
      </div>
    </div>
  );
}

export default App;