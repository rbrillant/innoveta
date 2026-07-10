import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <main className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="text-center max-w-md">
            <span className="text-4xl block mb-3">⚠</span>
            <h2 className="text-xl font-bold text-black dark:text-gray-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-black dark:text-gray-400 mb-4">Try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer"
            >
              Reload
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
