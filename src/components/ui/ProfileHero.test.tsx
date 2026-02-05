import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileHero } from './ProfileHero';

describe('ProfileHero', () => {
  it('should render title and subtitle correctly', () => {
    render(
      <ProfileHero 
        title="Rex" 
        subtitle="Labrador"
      />
    );

    expect(screen.getByText('Rex')).toBeInTheDocument();
    expect(screen.getByText('Labrador')).toBeInTheDocument();
  });

  it('should render image when imageUrl is provided', () => {
    render(
      <ProfileHero 
        title="Rex" 
        imageUrl="http://example.com/rex.jpg"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/rex.jpg');
    expect(img).toHaveAttribute('alt', 'Rex');
  });

  it('should render fallback initial when no image is provided', () => {
    render(
      <ProfileHero 
        title="Tutor John" 
        variant="tutor"
        fallbackInitial="J"
      />
    );

    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render actions and handle clicks', () => {
    const handleEdit = vi.fn();
    
    render(
      <ProfileHero 
        title="Rex" 
        actions={<button onClick={handleEdit}>Edit</button>}
      />
    );

    const button = screen.getByText('Edit');
    fireEvent.click(button);

    expect(handleEdit).toHaveBeenCalledTimes(1);
  });
});
