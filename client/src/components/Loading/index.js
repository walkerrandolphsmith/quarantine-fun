import React from 'react';
import logo from './logo.svg';
import './Loading.css';

export function Loading () {
  return (
    <div>
      <header className="flex flex-col items-center justify-center w-screen h-screen">
        <img src={logo} className="Loading-logo" alt="logo" />
        <p className="block text-gray-700 text-sm mb-2">Loading</p>
      </header>
    </div>
  );
}