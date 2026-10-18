declare module 'next' {
  export interface NextConfig {
    [key: string]: any;
  }
  export interface Metadata {
    metadataBase?: URL | null | string;
    title?: string | { default: string; template: string };
    description?: string;
    keywords?: string[] | string;
    authors?: Array<{ name: string; url?: string }>;
    creator?: string;
    publisher?: string;
    robots?: string | { index?: boolean; follow?: boolean };
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      locale?: string;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      images?: string[];
      creator?: string;
    };
    alternates?: {
      canonical?: string;
    };
    icons?: {
      icon?: string | Array<{ url: string; sizes?: string; type?: string }>;
      apple?: string | Array<{ url: string; sizes?: string; type?: string }>;
    };
  }
}

declare module 'next/types.js' {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
  export * from 'next';
}

declare module 'next/font/google' {
  export function Montserrat(options?: any): { className: string; variable: string; style: { fontFamily: string } };
  export function Inter(options?: any): { className: string; variable: string; style: { fontFamily: string } };
  export function Geist(options?: any): { className: string; variable: string; style: { fontFamily: string } };
  export function Geist_Mono(options?: any): { className: string; variable: string; style: { fontFamily: string } };
}

declare module 'next/image' {
  import * as React from 'react';
  export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string | any;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    quality?: number | `${number}`;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    sizes?: string;
  }
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module 'next/link' {
  import * as React from 'react';
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string | any;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    children?: React.ReactNode;
  }
  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function notFound(): never;
}

declare module 'next/server' {
  export const NextResponse: any;
  export const NextRequest: any;
  export type NextMiddleware = any;
}

declare module 'next/server.js' {
  export const NextResponse: any;
  export const NextRequest: any;
  export type NextMiddleware = any;
}

