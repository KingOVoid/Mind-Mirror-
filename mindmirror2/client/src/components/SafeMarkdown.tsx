import React from 'react';
import OriginalReactMarkdown, { type Options } from 'react-markdown';

export interface SafeMarkdownProps extends Omit<Options, 'children'> {
  className?: string;
  children?: string | null;
  content?: string | null;
}

/**
 * SafeMarkdown wrapper that:
 * 1. Guarantees null/undefined inputs strictly default to empty string ('')
 * 2. Prevents react-markdown v10 AssertionError on className prop by rendering a wrapping <div>
 * 3. Applies Tailwind typography styles (e.g. prose prose-slate max-w-none) properly
 */
export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({
  className = 'prose prose-slate max-w-none',
  children,
  content,
  ...props
}) => {
  const safeText = (children !== undefined && children !== null ? String(children) : (content !== undefined && content !== null ? String(content) : '')) || '';

  return (
    <div className={className}>
      <OriginalReactMarkdown {...props}>
        {safeText}
      </OriginalReactMarkdown>
    </div>
  );
};

export default SafeMarkdown;
