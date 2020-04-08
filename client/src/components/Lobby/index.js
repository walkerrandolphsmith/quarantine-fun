import React, { useState, useEffect, Fragment } from 'react';

export function Lobby () {

    const [gameCode, setGameCode] = useState('');
    const [isSpyMaster, setIsSpyMaster] = useState(false);

    function onChange(event) {
        const pendingCode = event.target.value;
        setGameCode(pendingCode);
    }

    function onRoleChange(event) {
        const value = event.target.checked;
        setIsSpyMaster(value);
    }

    function play() {
        const route = isSpyMaster ? '/spymaster/' : '/round/';
        window.location.href = route + gameCode;
    }

    const isDisabled = gameCode === '';

    console.log('isDisabled', isDisabled)

    return (
        <div className="h-screen w-screen flex">
            <div className="w-full max-w-xs m-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="md:w-2/3 block text-gray-700 font-bold flex">
                            <span className="text-sm mb-2">
                                SpyMaster
                            </span>
                            <input className="ml-2 mt-1 leading-tight" type="checkbox" onChange={onRoleChange}/>
                        </label>
                    </div>
                    <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" for="password">
                        GAME CODE
                    </label>
                    <input onChange={onChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="XXXXXXXXXX" />
                    </div>
                    <div className="flex items-center justify-between">
                    <button disabled={isDisabled} onClick={play} className="disabled:opacity-75 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Play
                    </button>
                    <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">

                    </a>
                    </div>
                </div>
                <p className="text-center text-gray-500 text-xs">
                    &copy; Good Vibes Only
                </p>
            </div>
        </div>
    )
}