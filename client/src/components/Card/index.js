import React from 'react';

const BLUE = 0;
const RED = 1;
const DEATH = 2;
const NEUTRAL = -1;
const UNKNOWN = 3;

const GetCardColor = (owner) => {
    if (owner === BLUE) return 'bg-blue-700';
    if (owner === RED) return 'bg-red-700';
    if (owner === DEATH) return 'bg-gray-700';
    if (owner === NEUTRAL) return 'bg-yellow-200';
    return 'bg-orange-200';
}

export function Card({ text, onClick, owner, hasBeenSelected, isReadonly }) {
    const backgroundColor = GetCardColor(owner);
    const pointerClass = hasBeenSelected ? 'cursor-default' : 'cursor-pointer'
    const textClass = hasBeenSelected ? 'line-through' : '';

    return (
      <div
        className={`flex justify-center md:flex rounded-lg p-6 sm:py-8 py-16 shadow-2xl ${backgroundColor} ${pointerClass}`}
        onClick={onClick}
      >
        <div className="md:text-left">
          <h2 className={`text-2xl break-all ${pointerClass} ${textClass}`}>{text}</h2>
        </div>
      </div>
    )
  }