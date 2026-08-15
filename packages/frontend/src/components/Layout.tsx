import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ leftColumn, rightColumn }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Левая колонка: Форма и История заданий (5 колонок) */}
          <div className="lg:col-span-5 space-y-6">{leftColumn}</div>

          {/* Правая колонка: Детали активного задания (7 колонок) */}
          <div className="lg:col-span-7">{rightColumn}</div>
        </div>
      </main>
    </div>
  );
};