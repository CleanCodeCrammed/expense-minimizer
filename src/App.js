import React, { useState, useEffect } from 'react';
import './App.css';

const expenseTypes = ['Monetary', 'Time', 'Emotional/Mental'];

function App() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState([]);
  const [selectedType, setSelectedType] = useState(expenseTypes[0]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(month));
    if (saved) setExpenses(JSON.parse(saved));
  }, [month]);

  useEffect(() => {
    localStorage.setItem(storageKey(month), JSON.stringify(expenses));
  }, [expenses, month]);

  function storageKey(month) {
    return `expenses_${month}`;
  }

  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  function handleAddExpense() {
    const description = prompt('Enter Expense Description:');
    if (description) {
      setExpenses([...expenses, { type: selectedType, description }]);
    }
  }

  function handleRemoveExpense(index) {
    setExpenses(expenses.filter((_, i) => i !== index));
  }

  function handleSendMessage() {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { user: chatInput, bot: "Think about cutting unnecessary expenses!" }]);
      setChatInput('');
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Main App */}
      <div style={{ flex: 3, padding: 20 }}>
        <h1>ExpenseMinimizer</h1>

        {/* Month Selector */}
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {generateMonthOptions().map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Expense Type Tabs */}
        <div style={{ marginTop: 20 }}>
          {expenseTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                marginRight: 10,
                padding: 10,
                backgroundColor: selectedType === type ? '#ccc' : '#eee'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Expense Items List */}
        <div style={{ marginTop: 20 }}>
          <h2>{selectedType} Expenses</h2>
          <button onClick={handleAddExpense}>Add Expense</button>
          <ul>
            {expenses
              .filter(e => e.type === selectedType)
              .map((e, index) => (
                <li key={index}>
                  {e.description}
                  <button onClick={() => handleRemoveExpense(index)} style={{ marginLeft: 10 }}>
                    Remove
                  </button>
                </li>
              ))
            }
          </ul>
        </div>
      </div>

      {/* Chatbox */}
      <div style={{ flex: 1, borderLeft: '1px solid #ccc', padding: 20 }}>
        <h2>ExpenseMinimizerGPT</h2>
        <div style={{ height: '80%', overflowY: 'auto', marginBottom: 10 }}>
          {chatMessages.map((m, i) => (
            <div key={i}>
              <strong>You:</strong> {m.user}<br />
              <strong>Bot:</strong> {m.bot}<br /><br />
            </div>
          ))}
        </div>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask for advice..."
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button onClick={handleSendMessage} style={{ width: '100%' }}>Send</button>
      </div>
    </div>
  );
}

function generateMonthOptions() {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export default App;