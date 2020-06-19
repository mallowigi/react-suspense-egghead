import React from 'react';
import {fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback} from '../pokemon';
import {createResource, preloadImage} from '../utils';

const imgSrcResourceCache = {};

function Img({src, alt, ...props}) {
  let image = imgSrcResourceCache[src];
  if (!image) {
    image = createResource(preloadImage(src));
    imgSrcResourceCache[src] = image;
  }
  return <img alt={alt} src={image.read()} {...props} />;
}

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read();
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <Img src={pokemon.image} alt={pokemon.name} />
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
  return createResource(fetchPokemon(pokemonName));
}

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
