import type { ReactElement, ComponentType } from 'react';

declare module 'react-markdown' {
  export interface ExtraProps {
    node?: any;
  }

  export interface ReactMarkdownProps {
    children?: string | null;
    content?: string | null;
    className?: string;
    components?: Record<string, ComponentType<any>>;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    [key: string]: any;
  }

  export function Markdown(props: ReactMarkdownProps): ReactElement;
  export default function ReactMarkdown(props: ReactMarkdownProps): ReactElement;
}
