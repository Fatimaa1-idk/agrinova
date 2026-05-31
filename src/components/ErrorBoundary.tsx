import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Agrinova] Erreur rendu:', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isDomError = error.message?.includes('removeChild') || error.message?.includes('insertBefore');

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-4xl">🌾</span>
          </div>

          <div>
            <h1 className="font-black text-xl text-primary">Une erreur est survenue</h1>
            <p className="text-sm text-primary/60 font-semibold mt-2 leading-relaxed">
              {isDomError
                ? "Une extension de votre navigateur (ex: Google Translate) interfère avec l'application. Désactivez-la ou utilisez le mode navigation privée."
                : "L'application a rencontré un problème inattendu."}
            </p>
          </div>

          {!isDomError && (
            <p className="text-xs text-primary/35 font-mono bg-surface-container px-3 py-2 rounded-xl text-left break-words">
              {error.message}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={this.reset}
              className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity text-sm"
            >
              Réessayer
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-surface-container text-primary font-bold rounded-2xl hover:bg-surface-container-high transition-colors text-sm"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
