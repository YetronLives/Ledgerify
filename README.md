# Ledgerify
Ledgerify is a secure, web-based accounting application that enables users to manage core financial processes while ensuring compliance, integrity, and usability. The system is designed for small businesses, managers, and accountants who need efficient tools to track financial transactions and generate reports.

<br>

## Team Name: The Five Ledgers

<br>

## Team Members
- Meriam Eddaoudi
- Shams Hasan
- DJ Berzas
- Alix Teschner
- Constant Nortey

## System Modules (Features & Functional Requirements) 

### Secure Authentication & User Management 

- Password Policies: Strong password rules (length, complexity, expiration, history, recovery). 

- Role-Based Access: Three user roles: Administrator, Manager, and Regular User; each with distinct permissions and views. 

### Chart of Accounts Management 

- Creation & Management: Create and manage a chart of accounts with unique validation. 

- Account Deactivation: Accounts cannot be deleted but can be marked inactive. 

- Reporting: Generate a report of all accounts in the chart of accounts. 

### Journalizing Transactions 

- Validation: Debit/credit balance must be enforced before saving. 

- Flexibility: Support multiple debits and credits per transaction. 

- Data Integrity: Only accounts from the chart of accounts can be used, with a searchable dropdown. 

- Documentation: Attach supporting source documents to transactions. 

### Transaction Approval Workflow 

- Approval Process: Transactions must be approved by managers before posting. 

- Transparency: Rejected transactions remain visible for review and correction. 

### Financial Reporting 

- Trial Balance: Includes only accounts with balances greater than zero. 

- Core Statements: Generate Income Statement, Balance Sheet, and Cash Flow Statement. 

- Accessibility: Reports accessible from the main navigation menu. 

### Ratio Analysis 

- Calculation: Compute key ratios (profitability, liquidity, solvency, efficiency). 

- Decision Support: Highlight out-of-range values automatically for analysis. 

### Usability Features 

- Built-in Help: Searchable help system integrated within the app. 

- Navigation: A clear table of contents to access modules quickly. 

- Cross-Platform Testing: Ensure responsiveness across devices (computers, tablets) and browsers (Chrome, Safari, Firefox, Edge). 

<br>

## Technology Stack 

**Frontend**: React.js for a responsive and interactive UI. 

**Backend**: Node.js with Express for server-side logic. Jest for writing unit tests 

**Database**: Firebase Firestore for real-time, scalable data storage. 

**Authentication & Security**: Firebase Auth for secure user management, roles, and password policies. 

**Deployment**: AWS or Firebase Hosting for scalable and reliable deployment. 

<br>
 
## Project Team Roles and Responsibilities 

**Project Manager / Lead Developer (Meriam)**: Oversees project timeline, integration, and deliverables. 

**Frontend Developer (Alix and Meriam)**: Implements UI with React.js. 

**Backend Developer (DJ and Constant)**: Handles server-side logic with Node.js/Express. 

**Database / Cloud Engineer (Dj and Shams)**: Manages Firebase setup, data, and deployment. 

**Tester / QA Engineer (Shams and Constant)**: Tests functionality, usability, and ensures deliverables meet requirements. 

<br>

## Project Team Communications Channel (Method agreed upon to communicate) (Due Sept 6th) 

**Primary Communication**: GroupMe (for daily updates, quick questions, and real-time collaboration). 

**Weekly Meetings**: One-hour team meeting every Monday at 10:00 AM via Microsoft Teams calls to review progress, resolve blockers, and plan next steps. 

**Documentation & File Sharing**: Shared OneDrive folder for all project documentation, design assets, and deliverables. Trello will be used for task tracking, and team members will also use email for formal updates when necessary. 

**Code Repository**: A private GitHub or GitLab repository will be used for version control and collaborative development. 

## Basic Scripts for running Frontend (React.js)
- `npm start` - Start development server (now with TypeScript support)
- `npm run build` - Build production bundle with TypeScript compilation
- `npm test` - Run tests with TypeScript support

## Basic Scripts for running Backend (Express.js)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production server