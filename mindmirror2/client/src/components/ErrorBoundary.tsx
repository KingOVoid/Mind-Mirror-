import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught a fatal render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopyStack = () => {
    const fullTrace = `Error: ${this.state.error?.name || 'Error'}: ${this.state.error?.message || ''}\n\nStack:\n${this.state.error?.stack || 'No stack'}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || 'No component stack'}`;
    navigator.clipboard.writeText(fullTrace);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#FAF8F5] text-[#242725]">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#E5C9BA] shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F7EFEA] text-[#B86B43] border border-[#E5C9BA] shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F7EFEA] text-[#B86B43] font-bold">
                  Runtime Exception Intercepted
                </span>
                <h2 className="text-xl font-bold font-display text-[#242725]">
                  {this.props.fallbackTitle || 'Notebook Render Error'}
                </h2>
                <p className="text-xs text-[#6D736E] leading-relaxed">
                  An unexpected render exception was caught by the Error Boundary. The details and full stack trace are displayed below to facilitate debugging.
                </p>
              </div>
            </div>

            {/* Error Message Card */}
            <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FECACA] space-y-2">
              <span className="text-[11px] font-bold font-mono text-[#DC2626] uppercase tracking-wider">
                Exception Message
              </span>
              <p className="text-xs font-mono font-medium text-[#991B1B] break-words">
                {this.state.error?.message || 'Unknown runtime error occurred.'}
              </p>
            </div>

            {/* Stack Trace Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#6D736E] font-semibold text-[11px]">
                  Stack Trace & Component Hierarchy
                </span>
                <button
                  type="button"
                  onClick={this.handleCopyStack}
                  className="flex items-center gap-1 text-[11px] font-mono text-[#5B8266] hover:text-[#43634D] cursor-pointer"
                >
                  {this.state.copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{this.state.copied ? 'Copied' : 'Copy Trace'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#121A14] text-[#86EFAC] font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64 border border-[#2E4234] select-text shadow-inner">
                {this.state.error?.stack || 'No stack trace available.'}
                {this.state.errorInfo?.componentStack && `\n\nComponent Hierarchy:${this.state.errorInfo.componentStack}`}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-5 rounded-2xl bg-[#5B8266] hover:bg-[#4A6D54] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Rendering Notebook</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="py-3 px-5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EDF3EE] border border-[#E6E1D8] text-[#242725] font-semibold text-xs transition cursor-pointer"
              >
                Reload Window
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
