import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';

function Board({ cards, onSelect, map, selections, realtimeselections }) {
  const picks = [...selections, ...realtimeselections].map(selection => parseInt(selection));
  return (
    <Grid>
      {cards.map(
        (card, index) => <Card
          key={index}
          text={card.text}
          onClick={() => onSelect(index)}
          owner={map[index]}
          hasBeenSelected={picks.includes(index)}
        />
      )}
    </Grid>
  )
}

export function SpyMaster({ client, selections }) {

  const { pathname } = useLocation();
  const gameId = pathname.split('/spymaster/')[1];

  const [game, setGame] = useState(null)
  useEffect(() => {
      fetch(`/api/game/${gameId}`)
      .then(r => r.json())
      .then(game => {
        setGame(game)
      })
      .catch(error => {})
    },
    [gameId]
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