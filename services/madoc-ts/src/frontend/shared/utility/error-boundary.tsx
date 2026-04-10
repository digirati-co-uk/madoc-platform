import React, { Component } from 'react';
import { ErrorPage } from '../components/NotFoundPage';

type ErrorBoundaryProps = { onError?: (error: Error, reset: () => void) => any; children?: React.ReactNode };

export class ErrorBoundary extends Component<ErrorBoundaryProps, any> {
  state: { didError: boolean; error?: Error } = { didError: false, error: undefined };

  componentDidCatch(error: Error) {
    this.setState({
      didError: true,
      error,
    });
  }

  resetError = () => {
    this.setState({ error: undefined, didError: false });
  };

  render() {
    if (this.state.didError) {
      if (!this.props.onError) {
        return <ErrorPage error={this.state.error} resetError={this.resetError} />;
      }

      return this.props.onError(this.state.error as any, this.resetError);
    }

    return this.props.children;
  }
}
