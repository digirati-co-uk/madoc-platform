import { Component } from 'react';

type ErrorBoundaryProps = { onError: (error: Error) => any };

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
      return this.props.onError(this.state.error as any);
    }

    return this.props.children;
  }
}
