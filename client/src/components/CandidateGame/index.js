import React, { useState, useEffect, Fragment } from 'react';
import { Link } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';

function Board({ cards, onSelect, map }) {
  return (
    <Grid>
      {cards.map(
        (card, index) => <Card card={card} onClick={() => onSelect(index)} owner={map[index]} />
      )}
    </Grid>
  )
}


function Card({ card, onClick, owner }) {
  const backgroundColor = (() => {
    if (owner === 0) return 'bg-indigo-700';
    if (owner === 1) return 'bg-red-700';
    if (owner === -1) return 'bg-orange-200'
    return 'bg-gray-700'
  })();

  return (
    <div
      className="md:flex bg-orange-200 rounded-lg p-6 shadow-2xl"
      onClick={onClick}
    >
      <img
        className="h-16 w-16 md:h-24 md:w-24 rounded-full mx-auto md:mx-0 md:mr-6"
        src={card.image !== 'null' ? card.image : `${process.env.PUBLIC_URL}/unkown.png`}
        alt={card.text}
      />
      <div className="text-center md:text-left">
        <h2 className="text-2xl break-all">({card.id}) {card.text}</h2>
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${backgroundColor}`}></div>
      </div>
    </div>
  )
}

export function CandidateGame() {
  const [game, setGame] = useState(null)
  const [gameId, setGameId] = useState(null)

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
    fetch('/api/replaceCard')
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

  const button = (
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      onClick={createGame}>
      Create Game
    </button>
  );

  const gameMasterHref = `/game/${gameId}`;
  const playerHref = `/play/${gameId}`;
  const gameMasterLink = (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
      <Link className="block w-full" to={gameMasterHref}>Game Masters</Link>
    </button>
  )
  const playerLink = (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-8">
      <Link className="block w-full" to={playerHref}>Players</Link>
    </button>
  )
  const links = (
    <Fragment>
      {gameMasterLink}
      {playerLink}
    </Fragment>
  )

  if(game === null) return <Loading />
  return (
    <Fragment>
      <Board {...game} onSelect={replaceCard} />
      {gameId !== null ? links : button}
    </Fragment>
  )
}
