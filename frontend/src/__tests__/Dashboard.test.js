import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../components/Dashboard';

describe('Dashboard Component', () => {

// Create mock user
    const mockUser = {
        fullName: 'Test User'
    };

    // Create mock users data
    const mockUsers = {
        'user1': { status: 'Active', passwordExpires: '2099-01-01' },
        'user2': { status: 'Active', passwordExpires: '2099-01-01' },
        'user3': { status: 'Inactive', passwordExpires: '2099-01-01' },
        'user4': { status: 'Active', passwordExpires: '2020-01-01' }, 
    };

    // Test case to ensure the dashboard renders the welcome message correctly
    test('renders the welcome message with the user\'s name', () => {
        render(<Dashboard user={mockUser} mockUsers={mockUsers} />);

        const welcomeMessage = screen.getByText(/Welcome, Test User!/i);
        expect(welcomeMessage).toBeInTheDocument();
    });

    // Test case to verify that all the stat cards are displayed
    test('displays all statistic cards', () => {
        render(<Dashboard user={mockUser} mockUsers={mockUsers} />);

        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
        expect(screen.getByText('Inactive Users')).toBeInTheDocument();
        expect(screen.getByText('Expired Passwords')).toBeInTheDocument();
    });

    // Test case to check if the statistics are calculated and displayed correctly
    test('calculates and displays the correct statistics', () => {
        render(<Dashboard user={mockUser} mockUsers={mockUsers} />);

        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        const inactiveUsersCard = screen.getByText('Inactive Users').closest('div');
        expect(within(inactiveUsersCard).getByText('1')).toBeInTheDocument();
        const expiredPasswordsCard = screen.getByText('Expired Passwords').closest('div');
        expect(within(expiredPasswordsCard).getByText('1')).toBeInTheDocument();
    });
});