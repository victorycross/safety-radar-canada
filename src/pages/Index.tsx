
import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import HomePage from './HomePage';

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
