import { CSSProperties } from 'react';

declare module 'react' {
  interface CSSProperties {
    '&:hover'?: CSSProperties;
    '&::before'?: CSSProperties;
    '& > div:first-child'?: CSSProperties;
  }
} 