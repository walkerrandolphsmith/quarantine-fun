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
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    function onNameChange(event) {
        setName(event.target.value);
    }

    function play() {
        const gameId = pathname.split('/join/')[1]

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

    const isDisabled = name === '';
    const nameErrorMessage = error && error.field === 'name' && <p className="text-red-500 text-xs italic">{error.message}</p>

    const joinButton = hasInvitation && (
        <button
            disabled={isDisabled}
            onClick={play}
            className={`${isDisabled ? 'opacity-50 ' : ''}disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="button"
        >
            Join
        </button>
    );

    const createButton = !hasInvitation && (
        <button
            disabled={isDisabled}
            onClick={quickStart}
            className={`${isDisabled ? 'opacity-50 ' : ''}disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="button"
        >
            Create Game
        </button>
    )

    const helpText = hasInvitation
        ? 'Join the game by entering your name'
        : 'Ask for an invitation if your friends already created a game'

    return (
        <div className="h-screen w-screen flex">
            <div className="w-full max-w-xs m-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Name
                        </label>
                        <input
                            onChange={onNameChange}
                            className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter your name"
                        />
                        {nameErrorMessage}
                    </div>
                    <p className="text-gray-500 text-xs italic mb-4">{helpText}</p>
                    <div className="flex items-center justify-center">
                        {joinButton}
                        {createButton}
                    </div>
                </div>
            </div>
        </div>
    )
}