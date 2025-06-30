
import React from 'react';
import HomePage from './HomePage';

const Index = () => {
  console.log('Index: Component rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <HomePage />
      </main>
    </div>
  );
};

export default Index;
