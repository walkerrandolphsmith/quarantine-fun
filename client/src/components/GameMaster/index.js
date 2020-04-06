import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { GetCardColor } from '../selectors';

function Board({ cards, onSelect, map, selections, realtimeselections }) {
  const picks = [...selections, ...realtimeselections].map(selection => parseInt(selection));
  return (
    <Grid>
      {cards.map(
        (card, index) => <Card key={index} card={card} onClick={() => onSelect(index)} owner={map[index]} hasBeenSelected={picks.includes(index)} />
      )}
    </Grid>
  )
}


function Card({ card, onClick, owner, hasBeenSelected }) {
  const backgroundColor = GetCardColor(owner);
  const pointerClass = hasBeenSelected ? '' : 'cursor-pointer'
  const cardColor = hasBeenSelected ? backgroundColor : 'bg-orange-200';

  return (
    <div
      className={`md:flex rounded-lg p-6 shadow-2xl ${cardColor} ${pointerClass}`}
      onClick={onClick}
    >
      { !hasBeenSelected && <img
        className="h-16 w-16 md:h-24 md:w-24 rounded-full mx-auto md:mx-0 md:mr-6"
        src={card.image !== 'null' ? card.image : `${process.env.PUBLIC_URL}/unkown.png`}
        alt={card.text}
      />}
      <div className="text-center md:text-left">
        <h2 className="text-2xl break-all">{card.text}</h2>
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${backgroundColor}`}></div>
      </div>
    </div>
  )
}

export function GameMaster({ client, selections }) {

  const { pathname } = useLocation();
  const gameId = pathname.split('/game/')[1];

  const [game, setGame] = useState(null)
  useEffect(() => {
      fetch(`/api/game/${gameId}`)
      .then(r => r.json())
      .then(game => {
        setGame(game)
      })
      .catch(error => {})
    },
    []
  );

  if(game == null) return <Loading />
  return <Board {...game} realtimeselections={Object.keys(selections)} onSelect={(index) => {
    client.send(JSON.stringify({
      index,
      gameId,
      type: 'cardselection',
    }))
  }} />
}