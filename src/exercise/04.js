import React from 'react';
import {fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback} from '../pokemon';
import {createResource} from '../utils';

/**
 * Simple component to display a Pokemon
 * @param pokemonResource The resource promise
 * @returns {JSX.Element}
 * @constructor
 */
function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read();
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  );
}

// Wait 4s before showing the fallback, and apply the pending transition for 700ms if the request takes longer than 300ms
const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
};

/**
 * Create a React Context
 * @type {React.Context<unknown>}
 */
const PokemonResourceCacheContext = React.createContext();

/**
 * Create a Context Provider for the PokemonCache. The provider will provide the getPokemonResource function
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
function PokemonCacheProvider({children, cacheTime}) {
  const cache = React.useRef({});
  const expirations = React.useRef({});

  // Start an interval to clear cache when it expires
  React.useEffect(() => {
    const interval = setInterval(() => {
      // For each expirations, if the current time is posterior, destroy the cache entry
      for (const [name, time] of Object.entries(expirations.current)) {
        if (time < Date.now()) {
          delete cache.current[name];
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * A memoized function to retrieve a pokemon from the Pokemon API and the cache.
   * @type {function(*): *}
   */
  const getPokemonResource = React.useCallback(
    (pokemonName) => {
      const lowerCaseName = pokemonName.toLowerCase();
      let resource = cache.current[lowerCaseName];
      if (!resource) {
        resource = createPokemonResource(lowerCaseName);
        cache.current[lowerCaseName] = resource;
      }

      // Add expiration to cacheTime seconds later
      expirations.current[lowerCaseName] = Date.now() + cacheTime;
      return resource;
    },
    [cacheTime],
  );

  return <PokemonResourceCacheContext.Provider value={getPokemonResource}>{children}</PokemonResourceCacheContext.Provider>;
}

/**
 * Returns the context value
 * @returns {unknown}
 */
function usePokemonResourceCache() {
  let context = React.useContext(PokemonResourceCacheContext);
  if (!context) {
    throw Error(`usePokemonResourceCache should be used within a PokemonCacheProvider`);
  }
  return context;
}

/**
 * Create a resource to retrieve a pokemon by name
 * @param pokemonName
 * @returns {{read(): (*|undefined)}}
 */
function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName));
}

/**
 * The main element.
 * It uses Suspense's fallback and transitions to dynamically fetch data.
 *
 * The App element should live within a PokemonCacheProvider in order to retrieve the cache.
 * @returns {JSX.Element}
 * @constructor
 */
function App() {
  const [pokemonName, setPokemonName] = React.useState('');
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG);
  const [pokemonResource, setPokemonResource] = React.useState(null);
  // Get the cached getPokemonResource memoized function
  const getPokemonResource = usePokemonResourceCache();

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null);
      return;
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName));
    });
  }, [getPokemonResource, pokemonName, startTransition]);

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
  }

  function handleReset() {
    setPokemonName('');
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonResource]}>
            <React.Suspense fallback={<PokemonInfoFallback name={pokemonName} />}>
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  );
}

/**
 * The main component wrapped within a PokemonCacheProvider
 * @returns {JSX.Element}
 * @constructor
 */
function AppWithProvider() {
  return (
    <PokemonCacheProvider cacheTime={5000}>
      <App />
    </PokemonCacheProvider>
  );
}

export default AppWithProvider;
