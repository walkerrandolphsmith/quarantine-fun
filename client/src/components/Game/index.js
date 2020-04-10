import React, { useState, useEffect, Fragment } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';
import { Timer } from '../Timer'

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

  const [hasTimer, setHasTimer] = useState(false);
  const [fiveMinutesFromNow, setFiveMinutesFromNow] = useState(null)

  function startTimer() {
    setHasTimer(true)
    setFiveMinutesFromNow(new Date(new Date().getTime() + 5*60000))
  }

  function clearTimer() {
    setHasTimer(false)
    setFiveMinutesFromNow(null)
  }

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

  if(game == null) return <Loading />

  const playersList = (teammates) => (
      <ul className="playerlist flex">
          {teammates.map((player, key) => {
              const classNames = `player ${player.team === 0 ? 'blue' : 'red'} ${player.role}`;
              return (
                  <li key={key} className={classNames}>
                      <div className="flex items-center justify-center bg-gray-300 text-white-700 text-sm font-bold">
                          <span className="playertag inline-block bg-gray-200 rounded-full px-3 text-sm font-semibold text-gray-700">{player.name}</span>
                      </div>
                  </li>
              )
          })}
      </ul>
  )

  const redPlayers = playersList(game.players.filter(player => player.team === 1))
  const bluePlayers = playersList(game.players.filter(player => player.team === 0))

  const winnerValue = game.winner >= 0 ? game.winner : winner;
  const hasWinner = winnerValue >= 0;

  const firstTeamBackground = hasWinner
    ? winnerValue === 0 ? 'bg-blue-700': 'bg-red-700'
    : game.firstTeam === 0 ? 'bg-blue-700': 'bg-red-700'
  const nav = (
    <nav className={`${firstTeamBackground} p-2 mt-0 fixed w-full z-10 top-0`}>
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          {bluePlayers}
          {redPlayers}
        </div>
    </nav>
  )

  function leave() {
    window.location.href = '/';
  }

  function playAgain() {
    client.send(JSON.stringify({
      type: 'branch',
      gameId
    }))
  }

  const replayButtons = hasWinner && (
    <Fragment>
        <button
            onClick={playAgain}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
        >
            Play Again
        </button>
        <button
            onClick={leave}
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-4"
            type="button"
        >
            Leave
        </button>
      </Fragment>
  );

  const timer = hasTimer && (
    <Fragment>
      <Timer fiveMinutesFromNow={fiveMinutesFromNow}/>
      <button
            onClick={clearTimer}
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-4"
            type="button"
        >
            Clear Timer
        </button>
    </Fragment>
  )

  const startTimerButton = !hasTimer && (
    <button
          onClick={startTimer}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-4"
          type="button"
      >
          Start Timer
      </button>
  );

  const buttons = hasWinner ? [replayButtons] : [timer, startTimerButton]

  return (
    <Fragment>
      {nav}
      <div className="mt-24">
        <div className="flex items-center justify-center">
          {buttons}
        </div>
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
      </div>
    </Fragment>
  )
}