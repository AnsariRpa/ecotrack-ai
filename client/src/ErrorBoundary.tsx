import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[React Error Boundary Catches]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "50px auto" }} className="glass-panel">
          <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>Something went wrong.</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            EcoTrack AI encountered an unexpected layout rendering error. Don't worry, your logged activity data is safe!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
