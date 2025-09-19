#Ledgerify App

**This repository contains a Mermaid flowchart illustrating the workflow of an accounting web application: Ledgerify, including:

User authentication and access control

Role-based main application dashboard

Features like chart of accounts, journal entries, financial reports, and user management

The diagram shows how users interact with the system, including login, registration, password recovery, and admin-specific actions.

``` mermaid
graph TD
    A[Start: User Accesses URL] --> B{Authenticated?}
    B -- No --> C[Login Screen]
    B -- Yes --> G[Main Application Dashboard]

    C --> C1[User enters credentials]
    C1 --> C1_Validate{Validation Check}
    C1_Validate -- Success --> G
    C1_Validate -- Invalid Credentials --> C1_Error[Show Error & Increment Attempts]
    C1_Validate -- Account Locked/Inactive --> C1_StatusError[Show Status Error]
    C1_Error --> C

    C --> C2[Clicks 'Create New User']
    C2 --> C2_Form[Registration Request Screen]
    C2_Form --> C2_Submit[User Submits Form]
    C2_Submit --> C2_Confirm[Show Confirmation & Notify Admin]
    C2_Confirm --> C

    C --> C3[Clicks 'Forgot Password?']
    C3 --> C3_Step1[Step 1: Enter Username/Email]
    C3_Step1 --> C3_Step2[Step 2: Answer Security Question]
    C3_Step2 --> C3_Step3[Step 3: Reset Password]
    C3_Step3 --> C3_Success[Show Success Message]
    C3_Success --> C

    G --> H[Navigation Sidebar]
    G -- Displays --> G_Alerts[Role-Specific Alerts]
    
    H --> I[Chart of Accounts]
    I --> I1[View/Search Accounts]
    I -- Admin Action --> I2[Clicks 'Add New Account']
    I2 --> I3[Add Account Modal]
    I3 --> I4[Submits Form]
    I4 --> I1

    H --> J[Journal Entries]
    J --> J1[View Journal List]
    J1 --> J2[Selects an Entry]
    J2 --> J3[View Entry Detail]
    J3 -- Admin/Manager & Pending --> J4{Approve/Reject?}
    J4 --> J5[Update Entry Status]
    J5 --> J1

    H --> K[Financial Reports]
    K --> K1[Selects Report Tab]
    K1 --> K2[Display Report e.g., Trial Balance]

    H -- Admin Only --> L[User Management]
    L --> L1[View User List]
    L1 --> L2[Admin Actions: Create, Filter, Suspend]

    H --> M[User Clicks Logout]
    M --> M1[Terminate Session]
    M1 --> C

    style G fill:#d4edda,stroke:#155724,stroke-width:2px
    style C fill:#f8d7da,stroke:#721c24,stroke-width:2px

```
