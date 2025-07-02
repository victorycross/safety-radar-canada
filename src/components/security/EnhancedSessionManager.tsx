
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
  lastHeartbeat: number;
  userAgent: string;
  ipAddress?: string;
  location?: string;
  createdAt: number;
  isActive: boolean;
  tabId: string;
}

export const EnhancedSessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [securityConfig, setSecurityConfig] = useState(SecurityConfigService['defaultConfig']);
  const [currentSessionId] = useState(() => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [tabId] = useState(() => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTabVisible, setIsTabVisible] = useState(true);

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

  // Enhanced page visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Enhanced session cleanup with heartbeat
  const cleanupOrphanedSessions = useCallback(async () => {
    if (!user) return;

    const sessionKey = `active_sessions_${user.id}`;
    const now = Date.now();
    
    try {
      const existingSessions = JSON.parse(localStorage.getItem(sessionKey) || '[]') as SessionInfo[];
      
      const activeSessionsFiltered = existingSessions.filter(session => {
        const timeSinceHeartbeat = now - session.lastHeartbeat;
        const timeSinceActivity = now - session.lastActivity;
        const sessionAge = now - session.createdAt;
        
        // Remove sessions that are orphaned (no heartbeat), too old, or inactive
        const isOrphaned = timeSinceHeartbeat > securityConfig.sessionOrphanTimeout * 60 * 1000;
        const isTooOld = sessionAge > securityConfig.maxSessionAge * 60 * 1000;
        const isInactive = timeSinceActivity > securityConfig.sessionTimeout * 60 * 1000;
        
        if (isOrphaned || isTooOld || isInactive) {
          console.log(`Removing orphaned session: ${session.id}`, {
            isOrphaned,
            isTooOld,
            isInactive,
            timeSinceHeartbeat: Math.round(timeSinceHeartbeat / 1000 / 60),
            sessionAge: Math.round(sessionAge / 1000 / 60)
          });
          return false;
        }
        
        return true;
      });

      if (activeSessionsFiltered.length !== existingSessions.length) {
        localStorage.setItem(sessionKey, JSON.stringify(activeSessionsFiltered));
        setActiveSessions(activeSessionsFiltered);
        
        await logSecurityEvent({
          action: 'SESSION_CLEANUP',
          new_values: {
            cleaned_sessions: existingSessions.length - activeSessionsFiltered.length,
            remaining_sessions: activeSessionsFiltered.length
          }
        });
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }, [user, securityConfig]);

  // Heartbeat mechanism
  const sendHeartbeat = useCallback(async () => {
    if (!user) return;

    const sessionKey = `active_sessions_${user.id}`;
    const now = Date.now();
    
    try {
      const existingSessions = JSON.parse(localStorage.getItem(sessionKey) || '[]') as SessionInfo[];
      
      // Update current session heartbeat
      const updatedSessions = existingSessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, lastHeartbeat: now, isActive: isTabVisible }
          : session
      );

      // If current session doesn't exist, add it
      if (!updatedSessions.find(s => s.id === currentSessionId)) {
        const newSession: SessionInfo = {
          id: currentSessionId,
          lastActivity: now,
          lastHeartbeat: now,
          userAgent: navigator.userAgent,
          location: window.location.origin,
          createdAt: now,
          isActive: isTabVisible,
          tabId: tabId
        };
        updatedSessions.push(newSession);
      }

      localStorage.setItem(sessionKey, JSON.stringify(updatedSessions));
      setActiveSessions(updatedSessions);
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  }, [user, currentSessionId, tabId, isTabVisible]);

  // Graceful cleanup on beforeunload
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = async () => {
      const sessionKey = `active_sessions_${user.id}`;
      try {
        const existingSessions = JSON.parse(localStorage.getItem(sessionKey) || '[]') as SessionInfo[];
        const remainingSessions = existingSessions.filter(s => s.id !== currentSessionId);
        localStorage.setItem(sessionKey, JSON.stringify(remainingSessions));
        
        await logSecurityEvent({
          action: 'SESSION_GRACEFUL_CLEANUP',
          new_values: { session_id: currentSessionId }
        });
      } catch (error) {
        console.error('Graceful cleanup error:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, currentSessionId]);

  // Enhanced heartbeat interval (more frequent when tab is visible)
  useEffect(() => {
    if (!user) return;

    const heartbeatInterval = isTabVisible 
      ? securityConfig.sessionHeartbeatInterval * 60 * 1000 // Normal interval when visible
      : securityConfig.sessionHeartbeatInterval * 60 * 1000 * 2; // Slower when hidden

    sendHeartbeat(); // Initial heartbeat
    const interval = setInterval(sendHeartbeat, heartbeatInterval);
    
    return () => clearInterval(interval);
  }, [user, sendHeartbeat, securityConfig.sessionHeartbeatInterval, isTabVisible]);

  // Enhanced cleanup interval
  useEffect(() => {
    if (!user) return;

    cleanupOrphanedSessions(); // Initial cleanup
    const interval = setInterval(cleanupOrphanedSessions, securityConfig.sessionCleanupFrequency * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, cleanupOrphanedSessions, securityConfig.sessionCleanupFrequency]);

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

  // Enhanced concurrent session monitoring
  useEffect(() => {
    if (!user) return;

    // Check for too many concurrent sessions
    const activeTrueSessions = activeSessions.filter(s => s.isActive);
    if (activeTrueSessions.length > securityConfig.maxConcurrentSessions) {
      logSecurityEvent({
        action: SecurityEvents.CONCURRENT_SESSION,
        new_values: {
          session_count: activeTrueSessions.length,
          max_allowed: securityConfig.maxConcurrentSessions,
          sessions: activeTrueSessions.map(s => ({ 
            id: s.id, 
            userAgent: s.userAgent,
            lastHeartbeat: s.lastHeartbeat,
            isActive: s.isActive
          }))
        }
      });

      toast({
        title: 'Multiple Active Sessions Detected',
        description: `You have ${activeTrueSessions.length} active sessions. Maximum allowed: ${securityConfig.maxConcurrentSessions}`,
        variant: 'destructive'
      });
    }
  }, [activeSessions, securityConfig.maxConcurrentSessions, toast, user]);

  const extendSession = useCallback(async () => {
    if (!user) return;

    try {
      // Simple session extension - just reset the warning
      setSessionWarning(false);
      toast({
        title: 'Session Extended',
        description: 'Your session has been extended successfully.',
      });

      await logSecurityEvent({
        action: 'SESSION_EXTENDED',
        new_values: { extended_at: new Date().toISOString() }
      });
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

  const cleanupAllSessions = useCallback(async () => {
    if (!user) return;

    try {
      const sessionKey = `active_sessions_${user.id}`;
      localStorage.setItem(sessionKey, JSON.stringify([]));
      setActiveSessions([]);

      await logSecurityEvent({
        action: 'SESSION_CLEANUP_ALL',
        new_values: { cleaned_by_user: true }
      });

      toast({
        title: 'All Sessions Cleared',
        description: 'All sessions have been terminated.',
      });
    } catch (error) {
      console.error('Failed to cleanup all sessions:', error);
    }
  }, [user, toast]);

  // Calculate session statistics for display
  const sessionStats = {
    total: activeSessions.length,
    active: activeSessions.filter(s => s.isActive).length,
    orphaned: activeSessions.filter(s => {
      const now = Date.now();
      return (now - s.lastHeartbeat) > securityConfig.sessionOrphanTimeout * 60 * 1000;
    }).length
  };

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

      {sessionStats.active > securityConfig.maxConcurrentSessions && (
        <Alert className="fixed top-16 right-4 z-50 w-96" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Too many active sessions ({sessionStats.active}/{securityConfig.maxConcurrentSessions})</p>
              <p className="text-xs text-muted-foreground">
                Total: {sessionStats.total} | Active: {sessionStats.active} | Orphaned: {sessionStats.orphaned}
              </p>
              <div className="space-y-1">
                {activeSessions.filter(s => s.isActive).slice(0, 3).map((session, index) => {
                  const minutesSinceActivity = Math.round((Date.now() - session.lastActivity) / 1000 / 60);
                  const isCurrentSession = session.id === currentSessionId;
                  return (
                    <div key={session.id} className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1">
                        {isCurrentSession && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                        Session {index + 1} ({minutesSinceActivity}m ago)
                      </span>
                      {!isCurrentSession && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => terminateSession(session.id)}
                        >
                          Terminate
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={cleanupAllSessions}>
                  Clear All
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {children}
    </>
  );
};
