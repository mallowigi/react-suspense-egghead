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

// 🐨 create a SUSPENSE_CONFIG variable right here and configure timeoutMs to
// whatever feels right to you, then try it out and tweek it until you're happy
// with the experience.

function createPokemonResource(pokemonName) {
  let delay = 1500;
  return createResource(fetchPokemon(pokemonName, delay));
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');
  const [startTransition, isPending] = React.useTransition({
    timeoutMs: 4000,
  });
  const [pokemonResource, setPokemonResource] = React.useState(null);

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null);
      return;
    }
    // 🐨 wrap this next line in a startTransition call
    setPokemonResource(createPokemonResource(pokemonName));
    // 🐨 add startTransition to the deps list here
  }, [pokemonName]);

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
    startTransition(() => {
      setPokemonResource(createPokemonResource(newPokemonName));
    });
  }

  function handleReset() {
    setPokemonName('');
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div style={{opacity: isPending ? 0.6 : 1}} className="pokemon-info">
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
