import React from 'react';
import {fetchPokemon, PokemonDataView, PokemonErrorBoundary} from '../pokemon';

let pokemon;
let errorMessage;
let promise = fetchPokemon('pikacha').then(
  (pokemonData) => (pokemon = pokemonData),
  (error) => (errorMessage = error),
);

function PokemonInfo() {
  if (errorMessage) {
    throw errorMessage;
  }
  if (!pokemon) {
    throw promise;
  }

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  );
}

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        <PokemonErrorBoundary>
          <React.Suspense fallback={<div>Loading Pokemon...</div>}>
            <PokemonInfo />
          </React.Suspense>
        </PokemonErrorBoundary>
      </div>
    </div>
  );
}

export default App;
