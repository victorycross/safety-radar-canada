
import { logSecurityEvent, SecurityEvents } from './securityAudit';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
  ipAddress?: string;
  userAgent?: string;
  blocked: boolean;
  blockedUntil?: number;
}

interface IPAnalysis {
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  threat_score?: number;
  is_proxy?: boolean;
  is_vpn?: boolean;
}

export class EnhancedRateLimiter {
  private static cache = new Map<string, RateLimitEntry>();
  private static suspiciousIPs = new Set<string>();
  
  static async checkRateLimit(
    identifier: string, 
    maxAttempts: number = 10, 
    windowMs: number = 60000,
    options: {
      includeIPAnalysis?: boolean;
      blockDuration?: number;
      strictMode?: boolean;
    } = {}
  ): Promise<{ allowed: boolean; remainingAttempts: number; resetTime: number }> {
    
    const now = Date.now();
    const { blockDuration = 15 * 60 * 1000, strictMode = false } = options;
    
    // Get client IP and user agent
    const ipAddress = await this.getClientIP();
    const userAgent = navigator.userAgent;
    
    // Check if IP is blocked
    if (this.isIPBlocked(ipAddress)) {
      await logSecurityEvent({
        action: SecurityEvents.RATE_LIMIT_EXCEEDED,
        new_values: { 
          identifier,
          ip_address: ipAddress,
          reason: 'IP_BLOCKED'
        }
      });
      
      return { allowed: false, remainingAttempts: 0, resetTime: now + blockDuration };
    }
    
    const entry = this.cache.get(identifier) || {
      count: 0,
      firstRequest: now,
      lastRequest: now,
      ipAddress,
      userAgent,
      blocked: false
    };
    
    // Check if still within block period
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        resetTime: entry.blockedUntil 
      };
    }
    
    // Reset if window expired
    if (now - entry.firstRequest > windowMs) {
      entry.count = 0;
      entry.firstRequest = now;
      entry.blocked = false;
      entry.blockedUntil = undefined;
    }
    
    // Increment count
    entry.count++;
    entry.lastRequest = now;
    entry.ipAddress = ipAddress;
    entry.userAgent = userAgent;
    
    // Check if limit exceeded
    if (entry.count > maxAttempts) {
      entry.blocked = true;
      entry.blockedUntil = now + blockDuration;
      
      // Add IP to suspicious list if multiple violations
      if (entry.count > maxAttempts * 2) {
        this.suspiciousIPs.add(ipAddress);
      }
      
      await logSecurityEvent({
        action: SecurityEvents.RATE_LIMIT_EXCEEDED,
        new_values: { 
          identifier,
          attempts: entry.count,
          max_allowed: maxAttempts,
          ip_address: ipAddress,
          user_agent: userAgent,
          blocked_until: entry.blockedUntil
        }
      });
      
      // Perform IP analysis for suspicious activity
      if (options.includeIPAnalysis) {
        await this.analyzeIP(ipAddress);
      }
      
      this.cache.set(identifier, entry);
      return { allowed: false, remainingAttempts: 0, resetTime: entry.blockedUntil };
    }
    
    this.cache.set(identifier, entry);
    
    return { 
      allowed: true, 
      remainingAttempts: maxAttempts - entry.count,
      resetTime: entry.firstRequest + windowMs
    };
  }
  
  private static async getClientIP(): Promise<string> {
    try {
      // This would normally come from server-side headers
      // For client-side, we'll use a fallback approach
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.warn('Failed to get client IP:', error);
      return 'unknown';
    }
  }
  
  private static isIPBlocked(ipAddress: string): boolean {
    return this.suspiciousIPs.has(ipAddress);
  }
  
  private static async analyzeIP(ipAddress: string): Promise<IPAnalysis | null> {
    try {
      // This would integrate with a real IP analysis service
      // For demo purposes, we'll simulate the analysis
      const analysis: IPAnalysis = {
        country: 'Unknown',
        threat_score: Math.random() * 100,
        is_proxy: Math.random() > 0.9,
        is_vpn: Math.random() > 0.8
      };
      
      // Log suspicious IP characteristics
      if (analysis.threat_score > 70 || analysis.is_proxy || analysis.is_vpn) {
        await logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'suspicious_ip_analysis',
            ip_address: ipAddress,
            analysis
          }
        });
      }
      
      return analysis;
    } catch (error) {
      console.error('IP analysis failed:', error);
      return null;
    }
  }
  
  static clearEntry(identifier: string): void {
    this.cache.delete(identifier);
  }
  
  static unblockIP(ipAddress: string): void {
    this.suspiciousIPs.delete(ipAddress);
  }
  
  static getStats(): { totalEntries: number; blockedIPs: number; suspiciousIPs: number } {
    const blockedEntries = Array.from(this.cache.values()).filter(entry => entry.blocked);
    
    return {
      totalEntries: this.cache.size,
      blockedIPs: blockedEntries.length,
      suspiciousIPs: this.suspiciousIPs.size
    };
  }
}
