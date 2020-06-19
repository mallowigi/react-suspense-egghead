import React from 'react';
import {fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback} from '../pokemon';
import {createResource} from '../utils';
// 🐨 you'll need createResource from ../utils

// 🐨 Your goal is to refactor this traditional useEffect-style async
// interaction to suspense with resources. Enjoy!

function PokemonInfo({pokemonResource}) {
  const pokemon = createResource(pokemonResource).read();
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  );
}

function createPokemonResource(pokemonName) {
  return createResource(() => fetchPokemon(pokemonName));
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');
  const [pokemonResource, setPokemonResource] = React.useState(null);

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
    setPokemonResource(createPokemonResource(newPokemonName));
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        {pokemonResource ? (
          <PokemonErrorBoundary>
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
