import React from 'react';
import '../suspense-list/style-overrides.css';
import * as cn from '../suspense-list/app.module.css';
import Spinner from '../suspense-list/spinner';
import {createResource} from '../utils';
import {fetchUser, PokemonErrorBoundary, PokemonForm} from '../pokemon';

/**
 * Delay resolving content
 * @param time
 * @returns {function(*=): Promise<unknown>}
 */
const delay = (time) => (promiseResult) => new Promise((resolve) => setTimeout(() => resolve(promiseResult), time));

// Our components, delayed
const NavBar = React.lazy(() => import('../suspense-list/nav-bar').then(delay(500)));
const LeftNav = React.lazy(() => import('../suspense-list/left-nav').then(delay(2000)));
const MainContent = React.lazy(() => import('../suspense-list/main-content').then(delay(1500)));
const RightNav = React.lazy(() => import('../suspense-list/right-nav').then(delay(1000)));

// Use a loading pokeball for our fallback
const PokemonLoading = (
  <div className={cn.spinnerContainer}>
    <Spinner />
  </div>
);
const SUSPENSE_CONFIG = {timeoutMs: 4000};

function App() {
  const [startTransition] = React.useTransition(SUSPENSE_CONFIG);
  const [pokemonResource, setPokemonResource] = React.useState(null);

  function handleSubmit(pokemonName) {
    startTransition(() => {
      setPokemonResource(createResource(fetchUser(pokemonName)));
    });
  }

  // Empty state
  if (!pokemonResource) {
    return (
      <div className="pokemon-info-app">
        <div className={`${cn.root} totally-centered`} style={{height: '100vh'}}>
          <PokemonForm onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  function handleReset() {
    setPokemonResource(null);
  }

  return (
    <div className="pokemon-info-app">
      <div className={cn.root}>
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonResource]}>
          <React.SuspenseList revealOrder="forwards" tail="collapsed">
            {/* Navbar (delayed) */}
            <React.Suspense fallback={PokemonLoading}>
              <NavBar pokemonResource={pokemonResource} />
            </React.Suspense>

            <React.SuspenseList revealOrder="together">
              <div className={cn.mainContentArea}>
                {/* Left nav (delayed) */}
                <React.Suspense fallback={PokemonLoading}>
                  <LeftNav />
                </React.Suspense>
                {/* Main Content (delayed) */}
                <React.Suspense fallback={PokemonLoading}>
                  <MainContent pokemonResource={pokemonResource} />
                </React.Suspense>
                {/* Right nav (delayed) */}
                <React.Suspense fallback={PokemonLoading}>
                  <RightNav pokemonResource={pokemonResource} />
                </React.Suspense>
              </div>
            </React.SuspenseList>
          </React.SuspenseList>
        </PokemonErrorBoundary>
      </div>
    </div>
  );
}

export default App;
