import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the login screen on initial load', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome Back/i);
  expect(welcomeElement).toBeInTheDocument();
});
