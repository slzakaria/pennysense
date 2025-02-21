import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl text-tomato mb-4">Oops! Something went wrong</h1>
            <p className="text-navy mb-4">We're sorry for the inconvenience.</p>
            <div className="mb-4 p-4 bg-alice/20 rounded text-left overflow-auto max-h-[200px]">
              <pre className="text-sm text-navy">
                {this.state.error?.toString()}
              </pre>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-fluo text-navy rounded hover:bg-fluo/80"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-alice text-navy rounded hover:bg-alice/80"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}