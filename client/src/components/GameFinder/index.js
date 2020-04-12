import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { errorsByCode } from '../constants';

function addPlayer({ gameId, name, client, setError }) {
    return fetch('/api/addPlayer', {
        method: 'POST',
        headers: {
          'Content-Type': "application/json"
        },
        body: JSON.stringify({
            gameId,
            name,
        }),
      })
      .then(response => {
        if (response.ok) {
            client.send(JSON.stringify({
                gameId,
                type: 'playeradded',
            }))
            window.location.href = `/lobby/${gameId}`;
        } else {
            return response.json().then(error => setError(errorsByCode[error.code]))
        }
      })
}

export function GameFinder ({ client, hasInvitation }) {
    const { pathname } = useLocation();
    const [gameCode, setGameCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    function onGameCodeChange(event) {
        setGameCode(event.target.value);
    }

    function onNameChange(event) {
        setName(event.target.value);
    }

    function play() {
        const gameId = hasInvitation
            ? pathname.split('/join/')[1]
            : gameCode;

        addPlayer({
            gameId,
            name,
            client,
            setError
        });
    }

    function quickStart() {
        fetch('/api/createGame', {
            method: 'POST',
            headers: {
              'Content-Type': "application/json"
            },
            body: JSON.stringify({}),
          })
          .then(r => r.json())
          .then(game => addPlayer({ gameId: game.id, name, client, setError }))
    }

    const isQuickStartDisabled = name === '' || gameCode !== '';
    const isPlayDisabled = hasInvitation
        ? name === ''
        : name === '' || gameCode === '';
    const nameErrorMessage = error && error.field === 'name' && <p class="text-red-500 text-xs italic">{error.message}</p>
    const gameCodeErrorMessage = error && error.field === 'gameCode' && <p class="text-red-500 text-xs italic">{error.message}</p>


    const gameCodeField = !hasInvitation && (
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                GAME CODE
            </label>
            <input onChange={onGameCodeChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="XXXXXXXXXX" />
            {gameCodeErrorMessage}
        </div>
    );

    const joinButton = (
        <button
            disabled={isPlayDisabled}
            onClick={play}
            className={`${isPlayDisabled ? 'opacity-50 ' : ''}disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="button"
        >
            Join
        </button>
    );

    const quickStartButton = !hasInvitation && (
        <button
            disabled={isQuickStartDisabled}
            onClick={quickStart}
            className={`${isQuickStartDisabled ? 'opacity-50 ' : ''}disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="button"
        >
            Quick Start
        </button>
    )

    const helpText = hasInvitation
        ? 'Join the game with a name'
        : 'Join an existing game with a \'GAME CODE\' or start a new game with \'Quick Start\'';

    return (
        <div className="h-screen w-screen flex">
            <div className="w-full max-w-xs m-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Name
                        </label>
                        <input onChange={onNameChange} className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="XXXXXXXXXX" />
                        {nameErrorMessage}
                    </div>
                    {gameCodeField}
                    <div className="flex items-center justify-between">
                        {joinButton}
                        {quickStartButton}
                    </div>
                    <p class="text-gray-500 text-xs italic mt-4">{helpText}</p>
                </div>
                <p className="text-center text-gray-500 text-xs">
                    &copy; Good Vibes Only
                </p>
            </div>
        </div>
    )
}