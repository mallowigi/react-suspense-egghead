import React from 'react';
import {fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback} from '../pokemon';
import {createResource} from '../utils';

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

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
};

const pokemonResourceCache = {};
const PokemonResourceCacheContext = React.createContext(getPokemonResource);

function usePokemonResourceCache() {
  return React.useContext(PokemonResourceCacheContext);
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName));
}

function getPokemonResource(pokemonName) {
  const lowerCaseName = pokemonName.toLowerCase();
  let resource = pokemonResourceCache[lowerCaseName];
  if (!resource) {
    resource = createPokemonResource(lowerCaseName);
    pokemonResourceCache[lowerCaseName] = resource;
  }

  return resource;
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG);
  const [pokemonResource, setPokemonResource] = React.useState(null);
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

export default App;
