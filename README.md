# ExpenseMinimizer

ExpenseMinimizer is a cloud-hosted web application that helps users track and minimize different types of expenses across months, including:
- **Monetary** (measured in dollars $)
- **Time** (measured in hours)
- **Emotional/Mental** (measured in units)

Users can view, add, and remove expenses by type and month, and interact with a simple "ExpenseMinimizerGPT" chatbot that offers basic cost-saving advice. All data persists locally across sessions.

---

## Features

- **Month Selector**: Choose a specific month to manage expenses.
- **Expense Type Tabs**: Track expenses by Monetary, Time, and Emotional/Mental categories.
- **Expense Management**: Add named expenses with amounts, categorized by type.
- **Expense Formatting**:  
  - Monetary Expenses — displayed with **($)**  
  - Time Expenses — displayed with **(hours)**  
  - Emotional/Mental Expenses — displayed with **(units)**
- **Persistent Storage**: Expenses and chatbot conversations are saved using `localStorage`, maintaining state after reloads.
- **ExpenseMinimizerGPT Chat**:
  - Ask for advice about minimizing expenses.
  - Full chat history is persistent.
  - **Clear Chat** button to reset the conversation.

---

## Architecture Overview

| Layer | Technology Used |
|:------|:----------------|
| Frontend | React.js (Create React App) |
| Hosting | AWS Amplify (Static Web Hosting) |
| Version Control | GitHub |
| CI/CD Pipeline | GitHub → AWS Amplify (Automatic Deploy on Push) |
| Backend | Render (enables ChatGPT functionality) |

---

## AWS Services Integrated

- **AWS Amplify**:  
  - Frontend hosting.
  - Continuous Deployment (CI/CD) integrated with GitHub.
  - SSL certificate and public HTTPS access automatically configured.

---

## Project Deployment

- **Source Code**: [GitHub Repository Link](https://github.com/CleanCodeCrammed/expense-minimizer)
- **Live App**: [AWS Amplify App Link](https://main.d1wym3bjqwzec5.amplifyapp.com/)

---

## Future Enhancements

In a full production version, the following improvements will be made:
- **Improved Mobile Responsive Design**:
  - Enhance the UI to adapt perfectly for mobile devices (dialogue box dynamic adjustment).

---

## Challenges Faced

- CI/CD setup: Ensuring GitHub to Amplify automated deployment pipeline was correctly configured.
- Persistence: Redoing the project when DynamoDB failed and Git Hub rejected our OpenAI API was crucial.
- Backend Setup: Configuring the Render link properly in .env, and deciding on render as the ideal backend service

---

## How to Run Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/CleanCodeCrammed/expense-minimizer.git
    cd expense-minimizer
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm start
    ```

---

## License

This project is provided for academic and educational purposes.