import React from 'react';
import {fetchPokemon, PokemonDataView} from '../pokemon';

let pokemon;
let promise = fetchPokemon('pikachu').then((pokemonData) => (pokemon = pokemonData));

function PokemonInfo() {
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
        <React.Suspense fallback={<div>Loading Pokemon...</div>}>
          <PokemonInfo />
        </React.Suspense>
      </div>
    </div>
  );
}

export default App;
