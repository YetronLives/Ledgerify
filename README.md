
# Ledgerify

Ledgerify is a secure, web-based accounting application that enables users to manage core financial processes while ensuring compliance, integrity, and usability. The system is designed for small businesses, managers, and accountants who need efficient tools to track financial transactions and generate reports.

## Team Name: The Five Ledgers
* Meriam Eddaoudi
* Shams Hasan
* DJ Berzas
* Alix Teschner
* Constant Nortey
 
## Project Team Roles and Responsibilities 

**Project Manager / Lead Developer (Shams)**: Oversees project timeline, integration, and deliverables. 

**Frontend Developers (Alix and Meriam)**: Implements UI with React.js. 

**Backend Developers (DJ and Constant)**: Handles server-side logic with Node.js/Express. 

**Database / Cloud Engineers (DJ and Shams)**: Manages Supabase setup, data, and deployment. 

**Tester / QA Engineers (Alix and Constant)**: Tests functionality, usability, and ensures deliverables meet requirements. 

---

## System Modules (Features & Functional Requirements) 

### Secure Authentication & User Management 

* Password Policies: Strong password rules (length, complexity, expiration, history, recovery). 
* Role-Based Access: Three user roles: Administrator, Manager, and Regular User; each with distinct permissions and views. 

### Chart of Accounts Management 

* Creation & Management: Create and manage a chart of accounts with unique validation. 
* Account Deactivation: Accounts cannot be deleted but can be marked inactive. 
* Reporting: Generate a report of all accounts in the chart of accounts. 

### Journalizing Transactions 

* Validation: Debit/credit balance must be enforced before saving. 
* Flexibility: Support multiple debits and credits per transaction. 
* Data Integrity: Only accounts from the chart of accounts can be used, with a searchable dropdown. 
* Documentation: Attach supporting source documents to transactions. 

### Transaction Approval Workflow 

* Approval Process: Transactions must be approved by managers before posting. 
* Transparency: Rejected transactions remain visible for review and correction. 

### Financial Reporting 

* Trial Balance: Includes only accounts with balances greater than zero. 
* Core Statements: Generate Income Statement, Balance Sheet, and Cash Flow Statement. 
* Accessibility: Reports accessible from the main navigation menu. 

### Ratio Analysis 

* Calculation: Compute key ratios (profitability, liquidity, solvency, efficiency). 
* Decision Support: Highlight out-of-range values automatically for analysis. 

### Usability Features 

* Built-in Help: Help system integrated within the app. 
* Navigation: A clear table of contents to access modules quickly. 
* Cross-Platform Testing: Ensure responsiveness across devices (computers, tablets) and browsers (Chrome, Safari, Firefox, Edge).
  
---

## Technology Stack 

**Frontend**: React.js, TailwindCSS and PostCSS for a responsive and interactive UI. 

**Backend**: Node.js with Express for server-side logic - Jest for writing unit tests.

**Database**: Supabase for real-time, scalable data storage. 

**Authentication & Security**: JWT for secure user management, roles, and password policies. 

**Deployment**: Render for scalable and reliable deployment. 

---

## Basic Scripts for running Frontend (React.js)
- `npm install` - to install all the dependecies of the project, that reads the package.json file and downloads all the packeges into the node-modules folder.
- `npm start` - Start development server (now with TypeScript support)
- `npm run build` - Build production bundle with TypeScript compilation
- `npm test` - Run tests with TypeScript support

## Basic Scripts for running Backend (Express.js)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production server
  
<a id="test-accounts"></a>
## Test Accounts (Use for Both Setup Options)

> 👨‍💻 For local development and testing only — not for production.  
  - Test accounts in progress

## Local Setup

1. [Install Node.js](https://nodejs.org/en)

2. Clone the repository
   * Copy and paste this command into terminal: ```git clone https://github.com/YetronLives/Ledgerify.git```
   * Then navigate into the project: ```cd Ledgerify```

3. Install dependencies
   * Navigate to the "frontend" folder in the repository.
   * Open the terminal within that folder (Make sure the folder you opened contains the package.json file).
   * Run ```npm install``` in the terminal.
This will install all necessary packages, including React.

4. Run the frontend
   * After the installation is complete, run ```npm start``` in the terminal.
This will start the application in your browser.
If it doesn't come up automatically, navigate to http://localhost:3000/

5. Run the backend
   * Navigate to the "backend" folder in the repository.
   * Open the terminal within that folder.
   * Run ```node server.js``` in the terminal.
This will start up the backend server.

5. Using the application
   * Here’s what the dashboard looks like:
     
     ![Ledgerify Dashboard](./screenshots/landing-page.png)
