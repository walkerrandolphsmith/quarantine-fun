import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import debounce from 'lodash.debounce';
import { Loading } from '../Loading';
import { errorsByCode } from '../constants';
import './Lobby.css';

export function Lobby({ client, players }) {

    const { pathname } = useLocation();
    const gameId = pathname.split('/lobby/')[1];
    
    const [error, setError] = useState(null);
    const [game, setGame] = useState(null)
    const [copyState, setCopyState] = useState(null);

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

    function resetCopyState() {
        setCopyState(null);
    }

    function copyGameCode(event) {
        const invitationLink = document.getElementById('invitation-link');
        invitationLink.select()
        let wasSuccessful = false;
        try {
            wasSuccessful = document.execCommand("copy")
        } catch (e) {
            wasSuccessful = false;
        }
        setCopyState(wasSuccessful);
        setTimeout(resetCopyState, 2500);
    }

    if(game == null) return <Loading />

    const roster = players.length <= 0 ? game.players : players;
    const hasMinNumberOfPlayers = roster.length > 1
    const isDisabled = !hasMinNumberOfPlayers;

    const placeholders = [...Array(8).keys()].map((_, i) => roster[i])

    const playersList = (
        <ul className="circle-container relative rounded-full list-none mt-20 mr-auto mb-0 border-solid border-4 border-gray-700 p-0">
            {placeholders.map((player, key) => {
                if (!player) return (
                    <li key={key} className="-m-12 block absolute w-24 h-24">
                        <div className="w-24 h-24 relative flex items-center justify-center bg-gray-300 text-white-700 text-sm font-bold duration-150 border-solid border-4 rounded-full hover:border-red-700 border-gray-700">
                            <span className="hidden inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"></span>
                        </div>
                    </li>
                )
                const cyclePlayer = _ => {
                    client.send(JSON.stringify({
                        type: 'cycleplayer',
                        gameId,
                        name: player.name
                    }))
                }
                const borderClasses = `border-solid rounded-full ${player.team === 0 ? 'border-blue-700' : 'border-red-700'}`;
                return (
                    <li key={key} className={`-m-12 cursor-pointer block absolute w-24 h-24`} onClick={debounce(cyclePlayer, 250)}>
                        <div className={`w-24 h-24 relative flex items-center justify-center bg-gray-300 text-white-700 text-sm font-bold duration-150 border-4 ${borderClasses}`}>
                            <span className="flex items-center justify-center absolute uppercase text-sm font-bold text-gray-700 block w-full h-full">
                                {player.role}
                            </span>
                            <span className={`mt-24 block relative bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 border-2 ${borderClasses}`}>
                                {player.name}
                            </span>
                        </div>
                    </li>
                )
            })}
        </ul>
    )

    const helpMessage = (() => {
        if (roster.length === 1) return 'find at least one more people to play.' 
        return "You're ready to play!" 
    })();

    const message = error
        ? <p className="text-red-500 text-xs italic mt-4">{error.message}</p>
        : <p className="text-gray-500 text-xs italic mt-4">{helpMessage}</p>

    const copyMessage = (() => {
        if (copyState === null) return 'Invite your friends with this link:';
        if (copyState) return 'Invitation copied!'
        return 'Try copy the code manually...'
    })();

    return (
        <div className="h-screen w-screen flex">
            <div className="w-full max-w-sm m-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    {playersList}
                    <div className="flex flex-col items-center justify-center mt-20">

                        <label className="block text-gray-700 text-sm mb-2" htmlFor="gameCode">
                            {copyMessage}
                        </label>
                        <div className="flex flex-wrap items-stretch w-full mb-4 relative shadow rounded">
                            <input
                                id="invitation-link"
                                type="text"
                                className="flex-shrink flex-grow flex-auto leading-normal w-px flex-1 border h-10 border-grey-light rounded rounded-r-none px-3 relative select-all outline-none cursor-default"
                                onClick={copyGameCode}
                                value={`${window.location.origin}/join/${gameId}`}
                            />
                            <div className="flex -mr-px">
                                <span
                                    className="flex items-center leading-normal bg-grey-lighter rounded rounded-l-none border border-l-0 border-grey-light px-3 whitespace-no-wrap text-grey-dark text-sm cursor-pointer"
                                    onClick={copyGameCode}
                                >
                                    Copy
                                </span>
                            </div>
                        </div>

                        <button
                            disabled={isDisabled}
                            onClick={startGame}
                            className={`${isDisabled ? 'opacity-50 ' : ''}disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline`}
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