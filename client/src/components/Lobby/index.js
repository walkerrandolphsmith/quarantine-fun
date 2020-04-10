import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { Loading } from '../Loading';
import { errorsByCode } from '../constants';

export function Lobby({ client, players }) {

    const { pathname } = useLocation();
    const gameId = pathname.split('/lobby/')[1];
    
    const [error, setError] = useState(null);
    const [game, setGame] = useState(null)

    useEffect(
        () => {
            fetch(`/api/game/${gameId}`)
            .then(r => r.json())
            .then(game => setGame(game))
        },
        [gameId]
    );

    function startGame() {
        fetch('/api/startGame', {
            method: 'POST',
            headers: {
              'Content-Type': "application/json"
            },
            body: JSON.stringify({
                gameId
            })
          })
          .then(response => {
            if (response.ok) {
                client.send(JSON.stringify({
                    gameId,
                    type: 'gamestarted',
                }));
                window.location.href = `/game/${gameId}`;
            } else {
                return response.json().then(error => setError(errorsByCode[error.code]))
            }
            return response;
          });
    }

    
    if(game == null) return <Loading />
    
    const roster = players.length <= 0 ? game.players : players;
    const hasTwoSpyMasters = roster.filter(player => player.role === 'spymaster').length == 2;
    const hasMinNumberOfPlayers = roster.length > 2
    const isDisabled = !hasMinNumberOfPlayers || !hasTwoSpyMasters;

    const placeholders = [...Array(8).keys()].map((_, i) => roster[i])

    const playersList = (
        <ul className="circle-container">
            {placeholders.map((player, key) => {
                const classNames = player ? `player ${player.team === 0 ? 'blue' : 'red'} ${player.role} cursor-pointer` : 'empty-node';
                const cyclePlayer = _ => {
                    if (!player) return;
                    client.send(JSON.stringify({
                        type: 'cycleplayer',
                        gameId,
                        name: player.name
                    }))
                }
                return (
                    <li key={key} className={classNames} onClick={cyclePlayer}>
                        <div className="flex items-center justify-center bg-gray-300 text-white-700 text-sm font-bold">
                            <span className="playertag inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{player && player.name}</span>
                        </div>
                    </li>
                )
            })}
        </ul>
    )

    const helpMessage = (() => {
        if (roster.length === 1) return 'find at least two more people to play.' 
        if (roster.length === 2) return 'find at least one more person to play.'
        return "You're ready to play!" 
    })();

    const message = error
        ? <p class="text-red-500 text-xs italic mt-4">{error.message}</p>
        : <p className="text-gray-500 text-xs italic mt-4">{helpMessage}</p>

    return (
        <div className="h-screen w-screen flex">
            <div className="w-full max-w-sm m-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {playersList}
                    <div className="flex flex-col items-center justify-center">
                        <button
                            disabled={isDisabled}
                            onClick={startGame}
                            className={`${isDisabled ? 'opacity-50 ' : ''}disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-32 rounded focus:outline-none focus:shadow-outline`}
                            type="button"
                        >
                            Ready to Play
                        </button>
                        {message}
                    </div>
                </div>
            </div>
        </div>
       
    )
}