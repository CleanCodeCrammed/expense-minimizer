import React, { useState, useEffect } from 'react';
import './App.css';

const expenseTypes = ['Monetary', 'Time', 'Emotional/Mental'];

const typeUnits = {
  'Monetary': '($)',
  'Time': '(hours)',
  'Emotional/Mental': '(units)'
};

function App() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState([]);
  const [selectedType, setSelectedType] = useState(expenseTypes[0]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const savedExpenses = localStorage.getItem(storageKey(month));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

    const savedChats = localStorage.getItem('chatMessages');
    if (savedChats) setChatMessages(JSON.parse(savedChats));
  }, [month]);

  useEffect(() => {
    localStorage.setItem(storageKey(month), JSON.stringify(expenses));
  }, [expenses, month]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  function storageKey(month) {
    return `expenses_${month}`;
  }

  function getCurrentMonth() {
    const now = new Date();
    return formatMonth(now.getFullYear(), now.getMonth());
  }

  function formatMonth(year, monthIndex) {
    const date = new Date(year, monthIndex);
    return `${date.toLocaleString('default', { month: 'long' })} ${year}`;
  }

  function parseMonth(monthStr) {
    const [monthName, year] = monthStr.split(' ');
    const date = new Date(`${monthName} 1, ${year}`);
    return { year: parseInt(year), monthIndex: date.getMonth() };
  }

  function generateMonthOptions() {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i);
      months.push(formatMonth(futureDate.getFullYear(), futureDate.getMonth()));
    }
    return months;
  }

  function handleAddExpense() {
    const name = prompt('Enter Expense Name:');
    if (!name) return;

    const amountInput = prompt('Enter Expense Amount (numbers only):');
    const amount = parseFloat(amountInput);
    if (isNaN(amount)) {
      alert('Invalid amount. Please enter a number.');
      return;
    }

    setExpenses([...expenses, { type: selectedType, name, amount }]);
  }

  function handleRemoveExpense(index) {
    setExpenses(expenses.filter((_, i) => i !== index));
  }

  function handleSendMessage() {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, {
        user: chatInput,
        bot: "Think about cutting unnecessary expenses!"
      }]);
      setChatInput('');
    }
  }

  function handleClearChat() {
    setChatMessages([]);
    localStorage.removeItem('chatMessages');
  }

  function formatAmount(expense) {
    switch (expense.type) {
      case 'Monetary':
        return `$${expense.amount}`;
      case 'Time':
        return `${expense.amount} hours`;
      case 'Emotional/Mental':
        return `${expense.amount} units`;
      default:
        return expense.amount;
    }
  }

  function calculateTotal(type) {
    return expenses
      .filter(e => e.type === type)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  function totalLabel(type) {
    switch (type) {
      case 'Monetary': return 'Total Monetary Expenses ($)';
      case 'Time': return 'Total Time Expenses (hours)';
      case 'Emotional/Mental': return 'Total Emotional/Mental Expenses (units)';
      default: return '';
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

        {/* Expense Section Header and Total */}
        <div style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>{selectedType} Expenses {typeUnits[selectedType]}</h2>
          <h3 style={{ margin: 0 }}>
            {totalLabel(selectedType)}: {calculateTotal(selectedType)}
          </h3>
        </div>

        {/* Expense Items List */}
        <div style={{ marginTop: 10 }}>
          <button onClick={handleAddExpense}>Add Expense</button>
          <ul>
            {expenses
              .filter(e => e.type === selectedType)
              .map((e, index) => (
                <li key={index}>
                  {e.name} — {formatAmount(e)}
                  <button
                    onClick={() => handleRemoveExpense(index)}
                    style={{ marginLeft: 10 }}
                  >
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
        <div style={{ height: '75%', overflowY: 'auto', marginBottom: 10 }}>
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
        <button onClick={handleSendMessage} style={{ width: '100%', marginBottom: 10 }}>Send</button>
        <button onClick={handleClearChat} style={{ width: '100%' }}>Clear Chat</button>
      </div>
    </div>
  );
}

export default App;