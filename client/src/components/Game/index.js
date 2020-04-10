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

  const firstTeamBackground = winner !== -1
    ? winner === 0 ? 'bg-blue-700': 'bg-red-700'
    : game.firstTeam === 0 ? 'bg-blue-700': 'bg-red-700'
  const nav = (
    <nav className={`${firstTeamBackground} p-2 mt-0 fixed w-full z-10 top-0`}>
        <div className="container mx-auto flex flex-wrap items-center">
		    <div className="flex w-full md:w-1/2 justify-center md:justify-start text-white font-extrabold">
				</div>
			<div className="flex w-full pt-2 content-center justify-between md:w-1/2 md:justify-end">
				<ul className="list-reset flex justify-between flex-1 md:flex-none items-center">
				  
				</ul>
			</div>
        </div>
    </nav>
  )

  return (
    <Fragment>
      
      {winner !== -1 && <span>{winnerName}</span>}
      {nav}
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