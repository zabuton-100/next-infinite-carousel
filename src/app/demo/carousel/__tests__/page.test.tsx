import React from 'react';
import { render, screen } from '@testing-library/react';
import CarouselDemo from '../page';

// smoke test: レンダリング時にエラーが発生しないこと
it('renders /demo/carousel page without crashing', () => {
  render(<CarouselDemo />);
  // タイトルが表示されていることを確認
  expect(screen.getByText('Carousel Demo')).toBeInTheDocument();
}); 