import type { Request } from "express";

export interface OAuthEnvironment {
  name: string;
  domain: string;
  protocol: string;
  redirectUri: string;
}

export class CrossEnvironmentOAuthManager {
  private static readonly KNOWN_ENVIRONMENTS = {
    development: {
      patterns: ['localhost', '.janeway.replit.dev'],
      protocol: 'https'
    },
    production: {
      patterns: ['.replit.app'],
      protocol: 'https'
    },
    preview: {
      patterns: ['.replit.dev'],
      protocol: 'https'
    }
  };

  static detectEnvironment(req: Request): OAuthEnvironment {
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.get('x-forwarded-proto') || 
                    (host.includes('localhost') ? 'http' : 'https');

    let envName = 'unknown';
    
    for (const [env, config] of Object.entries(this.KNOWN_ENVIRONMENTS)) {
      if (config.patterns.some(pattern => host.includes(pattern))) {
        envName = env;
        break;
      }
    }

    return {
      name: envName,
      domain: host,
      protocol,
      redirectUri: `${protocol}://${host}/api/auth/discord/callback`
    };
  }

  static generateAllRedirectUris(baseCallbackPath = '/api/auth/discord/callback'): string[] {
    const uris: string[] = [];
    
    // Development environments
    uris.push(`http://localhost:5000${baseCallbackPath}`);
    
    // Replit development domains
    if (process.env.REPLIT_DOMAINS) {
      const domains = process.env.REPLIT_DOMAINS.split(',');
      domains.forEach(domain => {
        uris.push(`https://${domain.trim()}${baseCallbackPath}`);
      });
    }

    // Common Replit patterns
    const replitPatterns = [
      '*.replit.app',
      '*.replit.dev',
      '*.janeway.replit.dev'
    ];

    replitPatterns.forEach(pattern => {
      uris.push(`https://${pattern}${baseCallbackPath}`);
    });

    return [...new Set(uris)]; // Remove duplicates
  }

  static getDiscordConfigInstructions(clientId: string): string {
    const allUris = this.generateAllRedirectUris();
    
    return `
Discord Developer Portal Configuration Instructions:

1. Go to: https://discord.com/developers/applications/${clientId}/oauth2
2. Add these Redirect URIs:

${allUris.map(uri => `   - ${uri}`).join('\n')}

3. Save changes

Note: Wildcard patterns (*.replit.app) may not work in Discord.
Add specific domains as they become available.
    `.trim();
  }

  static validateRedirectUri(requestedUri: string, req: Request): boolean {
    const environment = this.detectEnvironment(req);
    const expectedUri = environment.redirectUri;
    
    return requestedUri === expectedUri;
  }
}

export default CrossEnvironmentOAuthManager;