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

## How to set up locally

**Frontend**: 

*Step 1: Install Node.js*
Start by making sure you have Node.js installed on your system
Node.js: [Download & Install Node.js](https://nodejs.org/en) (which includes npm)

*Step 2: Clone the repository*
Using Github Desktop will likely be the easiest way to do this, as well as making it easy to commit changes
You can also use your browser or download the zip file

*Step 3: Install dependencies*
Navigate to the "frontend" folder in the repository.
Open the terminal within that folder (Make sure the folder you opened contains the package.json file)
Type "npm install" into the terminal
This will install all necessary packages, including React

*Step 4: Run the application*
After the installation is complete, type "npm start" into the terminal
This should automatically start the application in your browser
If it doesn't come up automatically, go to http://localhost:3000/

*Step 5: Using the application*
Now that you can open the appplication, you can test it using the mock data provided
The mock data will be in the App.jsx file, it provides multiple users from each role and account status
