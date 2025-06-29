
import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import HomePage from './HomePage';

const Index = () => {
  const { user } = useAuth();

  // If user is authenticated, use MainLayout with sidebar
  if (user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 py-6">
            <HomePage />
          </main>
        </div>
      </MainLayout>
    );
  }

  // If user is not authenticated, use the original layout with header
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
