import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-brandRed-50 text-brandRed flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 max-w-md font-body mb-6">
            An unexpected error occurred while rendering this view. Please try refreshing
            the page.
          </p>
          <Button
            onClick={this.handleReset}
            variant="primary"
            icon={RotateCcw}
            iconPosition="left"
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
