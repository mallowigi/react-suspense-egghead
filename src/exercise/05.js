import React from 'react';
import {fetchPokemon, getImageUrlForPokemon, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback} from '../pokemon';
import {createResource, preloadImage} from '../utils';

const PokemonInfo = React.lazy(() => import('../lazy/pokemon-info-render-as-you-fetch'));

/**
 * An cached image component that preload images before rendering the tag
 * @param src
 * @param alt
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
};

const pokemonResourceCache = {};

/**
 * Get Pokemon resource from cache or the API
 * @param name
 */
function getPokemonResource(name) {
  const lowerName = name.toLowerCase();
  let resource = pokemonResourceCache[lowerName];
  if (!resource) {
    resource = createPokemonResource(lowerName);
    pokemonResourceCache[lowerName] = resource;
  }
  return resource;
}

/**
 * Create a resource for retrieving pokemon data and image
 * @param pokemonName
 * @returns {{image: {read(): (*|undefined)}, data: {read(): (*|undefined)}}}
 */
function createPokemonResource(pokemonName) {
  const data = createResource(fetchPokemon(pokemonName));
  const image = createResource(preloadImage(getImageUrlForPokemon(pokemonName)));
  return {data, image};
}

/**
 * Our App Pokemon retriever
 * @returns {JSX.Element}
 * @constructor
 */
function App() {
  const [pokemonName, setPokemonName] = React.useState('');
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG);
  const [pokemonResource, setPokemonResource] = React.useState(null);

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null);
      return;
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName));
    });
  }, [pokemonName, startTransition]);

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

export default App;
