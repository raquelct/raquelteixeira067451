import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GridList } from './GridList';
import { Star } from 'lucide-react';
import type { ReactNode } from 'react';

describe('GridList', () => {
  const renderItem = (item: string): ReactNode => <div data-testid="item">{item}</div>;

  it('should render title and items', () => {
    const items: string[] = ['Item 1', 'Item 2'];
    render(
      <GridList<string> 
        title="Test List" 
        icon={Star} 
        items={items} 
        renderItem={renderItem} 
        emptyStateMessage="No items"
      />
    );

    expect(screen.getByText('Test List')).toBeInTheDocument();
    expect(screen.getAllByTestId('item')).toHaveLength(2);
  });

  it('should render empty state message when items are empty', () => {
    render(
      <GridList<string> 
        title="Test List" 
        icon={Star} 
        items={[]} 
        renderItem={renderItem} 
        emptyStateMessage="Nenhum pet/tutor vinculado"
      />
    );

    expect(screen.queryAllByTestId('item')).toHaveLength(0);
    expect(screen.getByText('Nenhum pet/tutor vinculado')).toBeInTheDocument();
  });
});
