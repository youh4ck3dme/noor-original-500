'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Loader2, X, Send } from 'lucide-react';
import { Button } from '../Button';

export interface CommandActionResult {
  message?: string;
  type?: string;
  data?: Record<string, unknown>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface AICommandBarProps {
  onCommand?: (command: string) => Promise<CommandActionResult | void> | void;
  placeholder?: string;
  className?: string;
}

export interface CommandResult {
  type: 'text' | 'action' | 'error' | 'loading';
  content: string;
  action?: {
    type: string;
    data: Record<string, unknown>;
    requiresConfirmation: boolean;
    confirmationMessage?: string;
  };
}

export const AICommandBar = ({
  onCommand,
  placeholder = 'Zadajte príkaz pre Mistral AI...',
  className,
}: AICommandBarProps) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<CommandResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    const userResult: CommandResult = {
      type: 'text',
      content: input,
    };
    setResults((prev) => [...prev, userResult]);
    setInput('');

    try {
      if (onCommand) {
        const loadingResult: CommandResult = {
          type: 'loading',
          content: 'Mistral spracováva váš príkaz...',
        };
        setResults((prev) => [...prev, loadingResult]);

        const result = await onCommand(input);

        if (result) {
          const responseResult: CommandResult = {
            type: 'action',
            content: result.message || 'Príkaz úspešne spracovaný',
            action: {
              type: result.type ?? 'command',
              data: result.data ?? {},
              requiresConfirmation: Boolean(result.requiresConfirmation),
              confirmationMessage: result.confirmationMessage,
            },
          };
          setResults((prev) => {
            const filtered = prev.filter((r) => r.type !== 'loading');
            return [...filtered, responseResult];
          });
        }
      }
    } catch (error) {
      const errorResult: CommandResult = {
        type: 'error',
        content: error instanceof Error ? error.message : 'Nastala chyba pri spracovaní príkazu',
      };
      setResults((prev) => {
        const filtered = prev.filter((r) => r.type !== 'loading');
        return [...filtered, errorResult];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResults([]);
    setInput('');
  };

  const getResultStyle = (type: CommandResult['type']) => {
    switch (type) {
      case 'text':
        return 'text-gm-text';
      case 'action':
        return 'text-gm-primary font-medium';
      case 'error':
        return 'text-red-500';
      case 'loading':
        return 'text-gm-text-muted italic';
      default:
        return 'text-gm-text';
    }
  };

  return (
    <>
      {/* Floating Command Bar */}
      <motion.div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 ${className}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.div
          className="relative w-[600px] max-w-[calc(100vw-4rem)]"
          whileTap={{ scale: 0.995 }}
          onClick={() => setIsOpen(true)}
        >
          {/* Command Bar Background */}
          <motion.div
            className="absolute inset-0 bg-white/60 backdrop-blur-2xl border border-gm-primary/20 rounded-2xl shadow-lg"
            animate={isLoading ? {
              boxShadow: [
                '0 0 0 0 rgba(139, 92, 246, 0.4)',
                '0 0 0 10px rgba(139, 92, 246, 0)',
                '0 0 0 0 rgba(139, 92, 246, 0.4)',
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Input Area */}
          <div className="relative flex items-center gap-3 px-6 py-4 cursor-text">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Loader2 className="w-5 h-5 text-gm-primary animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Sparkles className="w-5 h-5 text-gm-primary" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.input
                  key="input-open"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent border-none outline-none text-gm-text placeholder:text-gm-text-muted/60 text-sm font-light"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.span
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-gm-text-muted/80 text-sm font-light italic truncate"
                >
                  {placeholder}
                </motion.span>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isOpen && input.trim() && (
                <motion.button
                  key="send"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="p-1.5 rounded-full text-gm-primary hover:bg-gm-primary/10 transition-colors disabled:opacity-50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-1.5 rounded-full text-gm-text-muted hover:bg-gm-bg-soft transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gm-text-muted/60 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            ⌘K
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Command Results Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] max-w-[calc(100vw-4rem)] z-40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gm-surface border border-gm-border rounded-2xl shadow-xl overflow-hidden">
              {/* Results Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gm-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gm-primary" />
                  <span className="text-sm font-medium text-gm-text">Mistral AI</span>
                </div>
                <button
                  onClick={handleClear}
                  className="text-xs text-gm-text-muted hover:text-gm-text transition-colors"
                >
                  Vymazať
                </button>
              </div>

              {/* Results Content */}
              <div className="max-h-96 overflow-y-auto bg-gm-bg-soft/30">
                {results.length === 0 && !isLoading && (
                  <div className="px-6 py-12 text-center text-gm-text-muted/60">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Zadajte príkaz pre začatie</p>
                  </div>
                )}

                <div className="space-y-1">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      className={`px-6 py-3 ${result.type === 'text' ? 'text-right' : 'text-left'}`}
                      initial={{ opacity: 0, x: result.type === 'text' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <p className={`text-sm ${getResultStyle(result.type)}`}>
                        {result.content}
                      </p>
                      {result.action && result.action.requiresConfirmation && (
                        <ConfirmationPrompt
                          action={result.action}
                          onConfirm={async () => {
                            // Handle confirmation
                          }}
                          onCancel={() => {}}
                        />
                      )}
                    </motion.div>
                  ))}
                  {isLoading && results.length === 0 && (
                    <div className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gm-primary" />
                        <span className="text-sm text-gm-text-muted italic">
                          Čakajte, Mistral spracováva...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Footer */}
              <div className="px-6 py-4 bg-gm-surface">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-gm-bg-soft border border-gm-border rounded-gm-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gm-primary/30"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface ConfirmationPromptProps {
  action: NonNullable<CommandResult['action']>;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPrompt = ({ action, onConfirm, onCancel }: ConfirmationPromptProps) => {
  return (
    <motion.div
      className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-gm-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="text-sm text-yellow-800 mb-2">
        {action.confirmationMessage || 'Si si istý, že chceš vykonať túto akciu?'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-xs px-3 py-1"
        >
          Zrušiť
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
        >
          Potvrdiť
        </Button>
      </div>
    </motion.div>
  );
};

AICommandBar.ConfirmationPrompt = ConfirmationPrompt;
