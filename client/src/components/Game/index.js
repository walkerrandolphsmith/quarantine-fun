import React, { useState, useEffect, Fragment } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';
import { Timer } from '../Timer'
import './Game.css';

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
              onClick={() => {
                onSelect(index)
              }}
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
      <ul className="inline-flex">
          {teammates.map((player, key) => {
             const borderClasses = `border-solid border-2 rounded-full ${player.team === 0 ? 'border-blue-700' : 'border-red-700'}`;
              return (
                  <li key={key} className="w-12 h-12 block">
                      <div className={`tooltip w-12 h-12 relative flex items-center justify-center bg-gray-300 text-white-700 text-sm font-bold duration-150 ${borderClasses}`}>
                          <span className="flex items-center justify-center absolute uppercase text-sm font-bold text-gray-700 block w-full h-full">
                              {player.role === 'spy' ? 'spy': 'sm'}
                          </span>
                          <span className={`tooltip-text mt-12 w-48 bg-gray-200 rounded-full px-3 text-sm font-semibold text-gray-700 ${borderClasses}`}>
                            {player.name}
                          </span>
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
            End
        </button>
      </Fragment>
  );

  const timer = !hasWinner && hasTimer && (
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

  const startTimerButton = !hasWinner && !hasTimer && (
    <button
          onClick={startTimer}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-4"
          type="button"
      >
          Start Timer
      </button>
  );

  return (
    <Fragment>
      {nav}
      <div className="mt-24">
        <div className="flex items-center justify-center">
          {replayButtons}
          {timer}
          {startTimerButton}
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