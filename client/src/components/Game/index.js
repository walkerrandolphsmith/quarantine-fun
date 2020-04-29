import React, { useState, useEffect, Fragment } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { Grid } from '../Grid';
import { Card } from '../Card';
import { Timer } from '../Timer'

function Board({ cards, onSelect, map, realtimeselections, picks }) {
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


  function leave() {
    window.location.href = '/';
  }

  function playAgain() {
    client.send(JSON.stringify({
      type: 'branch',
      gameId
    }))
  }

  const winnerValue = game.winner >= 0 ? game.winner : winner;
  const hasWinner = winnerValue >= 0;

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

  const picks = [...game.selections, ...Object.keys(selections)].map(selection => parseInt(selection))

  const firstTeamColor = hasWinner
      ? winner === 0 ? 'border-blue-700': 'border-red-700'
      : game.firstTeam === 0 ? 'border-blue-700': 'border-red-700'

    const winnerName = winner === 0 ? 'Blue Team Wins': 'Red Team Wins'

    const firstTeamDeckSize = 9;
    const secondTeamDeckSize = 8;
    
    const blueTeamDeckSize = game.firstTeam === 0 ? firstTeamDeckSize : secondTeamDeckSize;
    const redTeamDeckSize = game.firstTeam !== 0 ?  firstTeamDeckSize : secondTeamDeckSize;


    const selectionsByTeam = game.cards.reduce((totals, _, index) => {
        const owner = selections[index] !== undefined
            ? selections[index]
            : game.selections.includes(index)
                ? game.map[index]
                : -2;

        if (owner === 0) totals.blue++;
        if (owner === 1) totals.red++;
        return totals;
    }, { red: 0, blue: 0 })

    const blueTeamRemainingDeckSize = blueTeamDeckSize - selectionsByTeam.blue;
    const redTeamRemainingDeckSize = redTeamDeckSize - selectionsByTeam.red;

    const nav = (
      <nav className={`${firstTeamColor} border-solid border-b-2 bg-white p-2 mt-0 fixed w-full z-10 top-0`}>
          <div className={`container mx-auto flex flex-wrap items-center ${hasWinner ? 'justify-center': 'justify-between'}`}>
                {!hasWinner && (
                    <Fragment>
                        <span className="text-lg font-bold">
                            {blueTeamRemainingDeckSize} Blue Cards Left
                        </span>
                        <div className="flex items-center justify-center">
                            {timer}
                            {startTimerButton}
                        </div>
                        <span className="text-lg font-bold">
                            {redTeamRemainingDeckSize} Red Cards Left
                        </span>
                    </Fragment>
                )}
                {hasWinner && (
                    <Fragment>
                    <span className="text-lg font-bold mr-2">
                        {winnerName}
                    </span>
                    {replayButtons}
                    </Fragment>
                )}
          </div>
      </nav>
    )

  return (
    <Fragment>
      {nav}
      <div className="mt-16">
        <Board
          {...game}
          realtimeselections={selections}
          picks={picks}
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