import React from 'react';
import {fetchPokemon, getImageUrlForPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback} from '../pokemon';
import {createResource, preloadImage} from '../utils';

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.data.read();
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemonResource.image.read()} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  );
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
};

const pokemonResourceCache = {};

function getPokemonResource(name) {
  const lowerName = name.toLowerCase();
  let resource = pokemonResourceCache[lowerName];
  if (!resource) {
    resource = createPokemonResource(lowerName);
    pokemonResourceCache[lowerName] = resource;
  }
  return resource;
}

function createPokemonResource(pokemonName) {
  const data = createResource(fetchPokemon(pokemonName));
  const image = createResource(preloadImage(getImageUrlForPokemon(pokemonName)));
  return {data, image};
}

/**
 * Custom hook that fetches a pokemonResource and uses Suspense's useTransition
 * @param pokemonName
 * @returns {unknown[]}
 */
function usePokemonResource(pokemonName) {
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG);
  const [pokemonResource, setPokemonResource] = React.useState(null);

  // Use layout effect for better performance than useEffect
  React.useLayoutEffect(() => {
    if (!pokemonName) {
      return;
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName));
    });
  }, [pokemonName, startTransition]);

  return [pokemonResource, isPending];
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');
  const [pokemonResource, isPending] = usePokemonResource(pokemonName);

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
