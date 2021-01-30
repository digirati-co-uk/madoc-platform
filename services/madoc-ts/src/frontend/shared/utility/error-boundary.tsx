import React, { Component } from 'react';
import { ErrorPage } from '../components/NotFoundPage';

type ErrorBoundaryProps = { onError?: (error: Error) => any };

export class ErrorBoundary extends Component<ErrorBoundaryProps, any> {
  state: { didError: boolean; error?: Error } = { didError: false, error: undefined };

  componentDidCatch(error: Error) {
    this.setState({
      didError: true,
      error,
    });
  }

  render() {
    if (this.state.didError) {
      if (!this.props.onError) {
        return <ErrorPage error={this.state.error} />;
      }

      return this.props.onError(this.state.error as any);
    }

    return this.props.children;
  }
}
