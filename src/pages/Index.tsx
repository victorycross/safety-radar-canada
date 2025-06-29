
import React from 'react';
import Header from '@/components/layout/Header';
import HomePage from './HomePage';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <HomePage />
      </main>
    </div>
  );
};

export default Index;
