import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { GetCardColor } from '../selectors';

function Board({ cards, onSelect, map, selections }) {

  Object.keys(selections).forEach(index => map[index] = selections[index]);

  return (
    <Grid>
      {cards.map(
        (card, index) => <Card key={index} card={card} onClick={() => onSelect(index)} owner={map[index]} />
      )}
    </Grid>
  )
}


function Card({ card, onClick, owner }) {
  const backgroundColor = GetCardColor(owner);

  return (
    <div
      className={`md:flex rounded-lg p-6 shadow-2xl ${backgroundColor}`}
      onClick={onClick}
    >
      <img
        className="h-16 w-16 md:h-24 md:w-24 rounded-full mx-auto md:mx-0 md:mr-6"
        src={card.image !== 'null' ? card.image : `${process.env.PUBLIC_URL}/unkown.png`}
        alt={card.text}
      />
      <div className="text-center md:text-left">
        <h2 className="text-2xl break-all">{card.text}</h2>
      </div>
    </div>
  )
}

export function Game({ client, selections }) {

  const { pathname } = useLocation();
  const gameId = pathname.split('/play/')[1];

  const [game, setGame] = useState(null)
  useEffect(() => {
      fetch(`/api/play/${gameId}`)
      .then(r => r.json())
      .then(game => {
        setGame(game)
      })
      .catch(error => {})
    },
    []
  );

  if(game == null) return <Loading />
  return <Board {...game} onSelect={() => {}} selections={selections} />
}