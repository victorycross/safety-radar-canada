
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';

export interface SecurityConfig {
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
  rateLimitWindow: number; // seconds
  maxRequestsPerWindow: number;
  enableGeoBlocking: boolean;
  blockedCountries: string[];
  requireMFA: boolean;
  passwordMinLength: number;
}

export class SecurityConfigService {
  private static defaultConfig: SecurityConfig = {
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    rateLimitWindow: 60,
    maxRequestsPerWindow: 100,
    enableGeoBlocking: false,
    blockedCountries: [],
    requireMFA: false,
    passwordMinLength: 12
  };

  static async getConfig(): Promise<SecurityConfig> {
    try {
      const { data, error } = await supabase
        .from('security_config')
        .select('*')
        .single();

      if (error || !data) {
        return this.defaultConfig;
      }

      return { ...this.defaultConfig, ...data.config };
    } catch (error) {
      console.error('Failed to load security config:', error);
      return this.defaultConfig;
    }
  }

  static async updateConfig(config: Partial<SecurityConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };

      const { error } = await supabase
        .from('security_config')
        .upsert({
          id: 'main',
          config: newConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await logSecurityEvent({
        action: SecurityEvents.CONFIG_CHANGE,
        new_values: { 
          changed_fields: Object.keys(config),
          new_config: newConfig
        }
      });
    } catch (error) {
      console.error('Failed to update security config:', error);
      throw error;
    }
  }

  static validateApiKey(key: string, keyType: 'openai' | 'mapbox' | 'stripe'): boolean {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{48}$/,
      mapbox: /^pk\.[a-zA-Z0-9]{60,}$/,
      stripe: /^sk_(test|live)_[a-zA-Z0-9]{24,}$/
    };

    return patterns[keyType]?.test(key) || false;
  }

  static async rotateApiKey(keyName: string, newKey: string): Promise<void> {
    try {
      // Validate the new key format
      const keyType = keyName.toLowerCase().includes('openai') ? 'openai' : 
                     keyName.toLowerCase().includes('mapbox') ? 'mapbox' :
                     keyName.toLowerCase().includes('stripe') ? 'stripe' : null;

      if (keyType && !this.validateApiKey(newKey, keyType)) {
        throw new Error(`Invalid ${keyType} API key format`);
      }

      await logSecurityEvent({
        action: 'API_KEY_ROTATION',
        new_values: { 
          key_name: keyName,
          rotated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('API key rotation failed:', error);
      throw error;
    }
  }
}
