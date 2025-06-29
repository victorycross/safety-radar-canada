import { useAuth } from '@/components/auth/AuthProvider';
import UserMenu from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl">Security Barometer</h1>
          <p className="text-sm text-muted-foreground">Canadian Operations Security Dashboard</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <UserMenu />
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
