// Type definitions for Next.js modules that don't have proper type definitions
declare module 'next' {
  export interface NextPage<P = {}, IP = P> {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  }
}

declare module 'next/head' {
  import { ReactNode } from 'react';
  interface HeadProps {
    children: ReactNode;
  }
  export default function Head(props: HeadProps): JSX.Element;
}

declare module 'next/link' {
  import { LinkProps as NextLinkProps } from 'next/dist/client/link';
  import { AnchorHTMLAttributes } from 'react';
  export type LinkProps = NextLinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;
  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module 'next/router' {
  import { NextRouter } from 'next/dist/shared/lib/router/router';
  export function useRouter(): NextRouter;
  export function withRouter(Component: any): any;
}

declare module 'next/dynamic' {
  import { ComponentType } from 'react';
  interface DynamicOptions {
    ssr?: boolean;
    loading?: () => JSX.Element | null;
  }
  export default function dynamic<P = any>(
    loader: () => Promise<ComponentType<P> | { default: ComponentType<P> }>,
    options?: DynamicOptions
  ): ComponentType<P>;
}

declare module 'next-auth/react' {
  export function signIn(provider?: string, options?: any): Promise<void>;
  export function signOut(options?: any): Promise<void>;
  export function useSession(): [any, boolean];
  export function getSession(options?: any): Promise<any>;
  export function getCsrfToken(options?: any): Promise<string>;
  export function getProviders(): Promise<Record<string, any>>;
  export function SessionProvider(props: { children: React.ReactNode }): JSX.Element;
  export const Provider: React.ComponentType<{
    children: React.ReactNode;
    session?: any;
  }>;
}

declare module 'next/script' {
  import { ScriptHTMLAttributes } from 'react';
  interface ScriptProps extends ScriptHTMLAttributes<HTMLScriptElement> {
    strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload' | 'worker';
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }
  export default function Script(props: ScriptProps): JSX.Element;
}
