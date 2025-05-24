declare module 'otplib' {
  export interface AuthenticatorOptions {
    step?: number;
    window?: number;
    crypto?: any;
    encoding?: string;
  }

  export interface Authenticator {
    generate(secret: string): string;
    check(token: string, secret: string): boolean;
    verify({ token, secret }: { token: string; secret: string }): boolean;
    generateSecret(length?: number, options?: any): string;
    keyuri(accountName: string, serviceName: string, secret: string, options?: any): string;
    options: AuthenticatorOptions;
  }

  export const authenticator: Authenticator;
  
  export function generateSecret(length?: number, options?: any): string;
  export function check(token: string, secret: string): boolean;
  export function verify({ token, secret }: { token: string; secret: string }): boolean;
}
