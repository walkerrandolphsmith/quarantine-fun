import React from 'react';

export function NotFound() {
    return (
        <div className="h-screen w-screen flex">
            <div className="w-full max-w-xs m-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <p className="text-gray-500 text-xs mb-4">
                        We couldn't find that game...
                    </p>
                    <div className="flex items-center justify-center">
                    <button
                        onClick={() => window.location = '/'}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                    >
                        Home
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
}