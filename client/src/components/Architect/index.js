import React, { useState, useEffect, Fragment } from 'react';
import { Link } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';

function GameLinks ({
  gameId,
}) {
  if (gameId === null) return null;

  const spyMasterHref = `/spymaster/${gameId}`;
  const playerHref = `/round/${gameId}`;
  const gameMasterLink = (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
      <Link className="block w-full" to={spyMasterHref}>Spy Masters</Link>
    </button>
  )
  const playerLink = (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-8">
      <Link className="block w-full" to={playerHref}>Players</Link>
    </button>
  )
  return (
    <Fragment>
      {gameMasterLink}
      {playerLink}
    </Fragment>
  )
}

function Configuration ({
  onSelect,
  createGame,
}) {
  return (
    <div className="flex justify-center">
      <div className="md:flex md:items-center mb-6">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
            Category
          </label>
          <div className="inline-block relative w-64">
            <select
              onChange={onSelect}
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              <option></option>
              <option>disney</option>
              <option>harrypotter</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <div className="w-full px-3">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={createGame}
          >
              Create Game
          </button>
        </div>
      </div>
    </div>
  )
}

function Board({ cards, onSelect, map }) {
  return (
    <Grid>
      {cards.map(
        (card, index) => <Card text={card.text} onClick={() => onSelect(index)} owner={map[index]} />
      )}
    </Grid>
  )
}

export function Architect() {
  const [game, setGame] = useState(null)
  const [gameId, setGameId] = useState(null)
  const [category, setCategory] = useState('');
  useEffect(() => {
      fetch('/api/getCandidateGame')
      .then(r => r.json())
      .then(game => {
        setGame(game)
      })
    },
    []
  );

  const replaceCard = (index) => {
    fetch(`/api/replaceCard/${category}`)
    .then(r => r.json())
    .then(replacement => {
      game.cards[index] = replacement;
      setGame({
        ...game,
        cards: [...game.cards]
      });
    });
  }

  const createGame = () => {
      fetch('/api/createGame', {
        method: 'POST',
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify(game),
      })
      .then(r => r.json())
      .then(data => {
        setGameId(data._id)
      })
  }

  const onSelectCategory = (event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    fetch(`/api/getCandidateGame/${newCategory}`)
      .then(r => r.json())
      .then(game => {
        setGame(game)
      })
  }

  function copyGameCode () {
    
  }

  if(game === null) return <Loading />
  return (
    <Fragment>
      <Configuration
        createGame={createGame}
        onSelect={onSelectCategory}
      />
      <span id="gameCode" onClick={copyGameCode}>{gameId}</span>
      <Board {...game} onSelect={replaceCard} />
      <GameLinks gameId={gameId} />
    </Fragment>
  )
}
