import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  reload = () => {
    window.location.reload();
  };

  goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
              <AlertTriangle
                size={28}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Something went wrong
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              An unexpected error stopped this page from loading. Try
              reloading, or head back home.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-left text-xs text-red-700 dark:text-red-400 overflow-auto max-h-40">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                icon={<RefreshCw size={14} />}
                onClick={this.reload}
              >
                Reload
              </Button>
              <Button icon={<Home size={14} />} onClick={this.goHome}>
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}