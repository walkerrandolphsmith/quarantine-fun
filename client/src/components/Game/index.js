import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';

function Board({ cards, onSelect, map, selections }) {

  Object.keys(selections).forEach(index => map[index] = selections[index]);

  return (
    <Grid>
      {cards.map(
        (card, index) => <Card
          key={index}
          text={card.text}
          onClick={() => onSelect(index)}
          owner={map[index]}
          isReadonly
        />
      )}
    </Grid>
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
    [gameId]
  );

  if(game == null) return <Loading />
  return <Board {...game} onSelect={() => {}} selections={selections} />
}