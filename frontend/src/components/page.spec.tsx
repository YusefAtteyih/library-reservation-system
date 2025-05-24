import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BooksPage from './page';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the next-auth/react hooks
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'Test User',
        role: 'STUDENT',
      }
    },
    status: 'authenticated',
  }),
}));

describe('BooksPage', () => {
  it('renders the books page with title', () => {
    render(<BooksPage />);
    expect(screen.getByText('Library Books')).toBeInTheDocument();
  });

  it('displays book table with correct information', async () => {
    render(<BooksPage />);
    
    // Wait for the mock data to load
    const bookTitle = await screen.findByText('Introduction to Algorithms');
    expect(bookTitle).toBeInTheDocument();
    
    expect(screen.getByText('Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein')).toBeInTheDocument();
    expect(screen.getByText('9780262033848')).toBeInTheDocument();
    
    // Check for status badges
    expect(screen.getAllByText('AVAILABLE')[0]).toBeInTheDocument();
    expect(screen.getByText('ON_LOAN')).toBeInTheDocument();
    expect(screen.getByText('RESERVED')).toBeInTheDocument();
    
    // Check for action links
    expect(screen.getAllByText('View')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Borrow')[0]).toBeInTheDocument();
    expect(screen.getByText('Join Waitlist')).toBeInTheDocument();
  });

  it('filters books when search is used', async () => {
    render(<BooksPage />);
    
    // Wait for the mock data to load
    await screen.findByText('Introduction to Algorithms');
    
    // All 5 books should be visible initially
    expect(screen.getAllByRole('row').length).toBe(6); // 5 books + header row
    
    // Search for "Java"
    const searchInput = screen.getByPlaceholderText('Search by title, author, or ISBN...');
    fireEvent.change(searchInput, { target: { value: 'Java' } });
    
    // Only "Effective Java" should be visible now
    expect(screen.getByText('Effective Java')).toBeInTheDocument();
    expect(screen.queryByText('Introduction to Algorithms')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBe(2); // 1 book + header row
  });

  it('does not show admin actions for student users', () => {
    render(<BooksPage />);
    
    // Admin actions should not be visible
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
