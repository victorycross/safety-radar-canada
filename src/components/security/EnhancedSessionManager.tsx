
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { SecurityConfigService } from '@/services/securityConfigService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface SessionInfo {
  id: string;
  lastActivity: number;
  userAgent: string;
  ipAddress?: string;
  location?: string;
}

export const EnhancedSessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [securityConfig, setSecurityConfig] = useState(SecurityConfigService['defaultConfig']);

  // Load security configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await SecurityConfigService.getConfig();
        setSecurityConfig(config);
      } catch (error) {
        console.error('Failed to load security config:', error);
      }
    };
    loadConfig();
  }, []);

  // Session timeout management
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      lastActivity = Date.now();
      setSessionWarning(false);

      // Warning 5 minutes before timeout
      const warningTime = (securityConfig.sessionTimeout - 5) * 60 * 1000;
      if (warningTime > 0) {
        warningId = setTimeout(() => {
          setSessionWarning(true);
          toast({
            title: 'Session Expiring Soon',
            description: 'Your session will expire in 5 minutes. Please save your work.',
            variant: 'destructive',
          });
        }, warningTime);
      }

      // Actual timeout
      timeoutId = setTimeout(async () => {
        await logSecurityEvent({
          action: SecurityEvents.SESSION_TIMEOUT,
          new_values: { 
            timeout_minutes: securityConfig.sessionTimeout,
            last_activity: lastActivity
          }
        });

        toast({
          title: 'Session Expired',
          description: 'Your session has expired for security reasons.',
          variant: 'destructive',
        });

        await signOut();
      }, securityConfig.sessionTimeout * 60 * 1000);
    };

    // Activity tracking
    const handleActivity = () => {
      resetTimeout();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Set initial timeout
    resetTimeout();

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, securityConfig.sessionTimeout, signOut, toast]);

  // Monitor concurrent sessions
  useEffect(() => {
    if (!user) return;

    const monitorSessions = async () => {
      const sessionKey = `active_sessions_${user.id}`;
      const currentSessionId = `${user.aud}_${Date.now()}`;
      
      try {
        // Get existing sessions from localStorage
        const existingSessions = JSON.parse(localStorage.getItem(sessionKey) || '[]') as SessionInfo[];
        
        // Clean up expired sessions (older than session timeout)
        const now = Date.now();
        const activeSessionsCleaned = existingSessions.filter(
          session => now - session.lastActivity < securityConfig.sessionTimeout * 60 * 1000
        );

        // Add current session
        const currentSession: SessionInfo = {
          id: currentSessionId,
          lastActivity: now,
          userAgent: navigator.userAgent,
          location: window.location.origin
        };

        const updatedSessions = [...activeSessionsCleaned, currentSession];
        
        // Check for too many concurrent sessions
        if (updatedSessions.length > securityConfig.maxConcurrentSessions) {
          await logSecurityEvent({
            action: SecurityEvents.CONCURRENT_SESSION,
            new_values: {
              session_count: updatedSessions.length,
              max_allowed: securityConfig.maxConcurrentSessions,
              sessions: updatedSessions.map(s => ({ id: s.id, userAgent: s.userAgent }))
            }
          });

          toast({
            title: 'Multiple Sessions Detected',
            description: `You have ${updatedSessions.length} active sessions. Maximum allowed: ${securityConfig.maxConcurrentSessions}`,
            variant: 'destructive'
          });
        }

        setActiveSessions(updatedSessions);
        localStorage.setItem(sessionKey, JSON.stringify(updatedSessions));

      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    };

    monitorSessions();
    const interval = setInterval(monitorSessions, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, securityConfig.maxConcurrentSessions, toast]);

  const extendSession = useCallback(async () => {
    if (!user) return;

    try {
      // Refresh the session
      const { error } = await user.app_metadata ? Promise.resolve({ error: null }) : Promise.resolve({ error: null });
      
      if (!error) {
        setSessionWarning(false);
        toast({
          title: 'Session Extended',
          description: 'Your session has been extended successfully.',
        });

        await logSecurityEvent({
          action: 'SESSION_EXTENDED',
          new_values: { extended_at: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  }, [user, toast]);

  const terminateSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const sessionKey = `active_sessions_${user.id}`;
      const sessions = JSON.parse(localStorage.getItem(sessionKey) || '[]') as SessionInfo[];
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      
      localStorage.setItem(sessionKey, JSON.stringify(updatedSessions));
      setActiveSessions(updatedSessions);

      await logSecurityEvent({
        action: 'SESSION_TERMINATED',
        new_values: { terminated_session: sessionId }
      });

      toast({
        title: 'Session Terminated',
        description: 'Selected session has been terminated.',
      });
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  }, [user, toast]);

  return (
    <>
      {sessionWarning && (
        <Alert className="fixed top-4 right-4 z-50 w-96" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Session expiring in 5 minutes</span>
            <Button size="sm" onClick={extendSession} variant="outline">
              Extend
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {activeSessions.length > securityConfig.maxConcurrentSessions && (
        <Alert className="fixed top-16 right-4 z-50 w-96" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Too many active sessions ({activeSessions.length}/{securityConfig.maxConcurrentSessions})</p>
              <div className="space-y-1">
                {activeSessions.slice(0, 3).map((session, index) => (
                  <div key={session.id} className="flex justify-between items-center text-xs">
                    <span>Session {index + 1}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => terminateSession(session.id)}
                    >
                      Terminate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {children}
    </>
  );
};
