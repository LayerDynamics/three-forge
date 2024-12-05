// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally, reload the page or reset the application state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI with error details
      return (
        <div style={{ padding: "20px", backgroundColor: "#f2dede", color: "#a94442" }}>
          <h1>Something went wrong.</h1>
          {this.state.error && <p>{this.state.error.toString()}</p>}
          {this.state.errorInfo && (
            <details style={{ whiteSpace: "pre-wrap" }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <button onClick={this.handleReload} style={{ marginTop: "10px" }}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
