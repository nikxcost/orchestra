import { useState, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from './Toast';

interface CodeBlockProps {
  children: ReactNode;
}

export const CodeBlock = ({ children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    const textToCopy = getTextContent(children);

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('Код скопирован', 'success');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        showToast('Код скопирован', 'success');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        showToast('Не удалось скопировать', 'error');
      }

      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative group my-4">
      <pre className="bg-neutral-900 text-neutral-100 p-4 pr-14 rounded-xl overflow-x-auto shadow-inner text-sm">
        {children}
      </pre>

      {/* Copy button - always visible on mobile, hover on desktop */}
      <button
        onClick={handleCopy}
        className={`
          absolute top-3 right-3
          p-2
          rounded-lg
          transition-all duration-200
          touch-manipulation
          ${copied
            ? 'bg-success-500 text-white'
            : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
          }
          opacity-100 sm:opacity-0 sm:group-hover:opacity-100
          focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900
        `}
        aria-label={copied ? 'Copied' : 'Copy code'}
        title={copied ? 'Скопировано!' : 'Копировать код'}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

// Helper function to extract text content from React children
function getTextContent(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }

  if (typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getTextContent).join('');
  }

  if (children && typeof children === 'object' && 'props' in children) {
    const props = children.props as { children?: ReactNode };
    if (props.children) {
      return getTextContent(props.children);
    }
  }

  return '';
}
