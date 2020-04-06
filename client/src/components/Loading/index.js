import React from 'react';
import logo from './logo.svg';

export function Loading () {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        Loading
      </header>
    </div>
  );
}