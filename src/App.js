import React, { useState, useEffect } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const expenseTypes = ['Monetary', 'Time', 'Emotional/Mental'];

const typeUnits = {
  Monetary: '($)',
  Time: '(hours)',
  'Emotional/Mental': '(units)',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
      setChatMessages([
        ...chatMessages,
        { user: chatInput, bot: 'Consider reviewing your expenses for potential savings.' },
      ]);
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

  function generateMonthOptions() {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const label = `${monthNames[monthIndex]} ${year}`;
      months.push({ key: monthKey, label });
    }
    return months;
  }

  const filteredExpenses = expenses.filter((e) => e.type === selectedType);
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const chartData = {
    labels: filteredExpenses.map((e) => e.name),
    datasets: [
      {
        label: `${selectedType} Expenses`,
        data: filteredExpenses.map((e) => e.amount),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const titleStyle = { fontSize: '1.5em', fontFamily: 'Arial, sans-serif' };

  return (
    <div className="app-container">
      {/* Main App */}
      <div className="main-content">
        <h1 style={titleStyle}>ExpenseMinimizer</h1>

        {/* Month Selector */}
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {generateMonthOptions().map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Expense Type Tabs */}
        <div className="expense-tabs">
          {expenseTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? 'active-tab' : ''}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Expense Title */}
        <h2 style={titleStyle}>
          {selectedType} Expenses {typeUnits[selectedType]}
        </h2>

        {/* Chart */}
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Total */}
        <div className="total-display">
          Total: {totalAmount} {typeUnits[selectedType]}
        </div>

        {/* Expense List */}
        <button onClick={handleAddExpense} className="add-expense-button">
          Add Expense
        </button>
        <ul className="expense-list">
          {filteredExpenses.map((e, index) => (
            <li key={index}>
              {e.name} — {formatAmount(e)}
              <button onClick={() => handleRemoveExpense(index)} className="remove-button">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chatbox */}
      <div className="chatbox">
        <h2 style={titleStyle}>ExpenseMinimizerGPT</h2>
        <div className="chat-messages">
          {chatMessages.map((m, i) => (
            <div key={i}>
              <strong>You:</strong> {m.user}
              <br />
              <strong>Bot:</strong> {m.bot}
              <br />
              <br />
            </div>
          ))}
        </div>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask for advice..."
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="chat-button">
          Send
        </button>
        <button onClick={handleClearChat} className="chat-button">
          Clear Chat
        </button>
      </div>
    </div>
  );
}

export default App;