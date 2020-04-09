import React, { useState, useEffect, Fragment } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';

function Board({ cards, onSelect, map, selections, realtimeselections }) {
  const picks = [...selections, ...Object.keys(realtimeselections)].map(selection => parseInt(selection));
  return (
    <Grid>
      {cards.map(
        (card, index) => {
          const owner = realtimeselections[index] !== undefined ? realtimeselections[index] : map[index];
          return (
            <Card
              key={index}
              text={card.text}
              onClick={() => onSelect(index)}
              owner={owner}
              hasBeenSelected={picks.includes(index)}
            />
          )
        }
      )}
    </Grid>
  )
}

export function Game({ client, selections, winner }) {

  const { pathname } = useLocation();
  const gameId = pathname.split('/game/')[1];

  const [game, setGame] = useState(null)
  useEffect(() => {
      fetch(`/api/game/${gameId}`)
      .then(r => r.json())
      .then(game => {
        setGame(game)
      })
      .catch(error => {
        console.log(error);
      })
    },
    [gameId]
  );

  const [winnerName, setWinnerName] = useState(null)
  useEffect(() => {
      setWinnerName(winner === 0 ? 'BLUE' : 'RED')
}, [winner])

  if(game == null) return <Loading />
  return (
    <Fragment>
      {winner !== -1 && <span>{winnerName}</span>}
      <Board
        {...game}
        realtimeselections={selections}
        onSelect={(index) => {
          client.send(JSON.stringify({
            index,
            gameId,
            type: 'cardselection',
          }))
        }}
      />
    </Fragment>
  )
}