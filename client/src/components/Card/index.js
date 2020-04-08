import React from 'react';

const BLUE = 0;
const RED = 1;
const DEATH = 2;
const NEUTRAL = -1;
const UNKNOWN = 3;

const GetCardColor = (owner) => {
    if (owner === BLUE) return 'bg-indigo-700';
    if (owner === RED) return 'bg-red-700';
    if (owner === DEATH) return 'bg-gray-700';
    if (owner === NEUTRAL) return 'bg-yellow-200';
    return 'bg-orange-200';
}

const getCardBackgroundImage = (owner) => {
  if (owner === BLUE) return 'blue.png';
  if (owner === RED) return 'red.png';
  if (owner === DEATH) return 'death.png';
  if (owner === NEUTRAL) return 'neutral.png'
}

const GetCardBackgroundImageStyles = (owner) => {
    return {
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundImage: `url(${process.env.PUBLIC_URL}/${getCardBackgroundImage(owner)})`
    };
}

export function Card({ text, onClick, owner, hasBeenSelected, isReadonly }) {
    const backgroundColor = GetCardColor(owner);
    const pointerClass = isReadonly || hasBeenSelected ? 'cursor-default' : 'cursor-pointer'
    const textClass = !isReadonly && hasBeenSelected ? 'line-through' : '';
    const styles = isReadonly ? GetCardBackgroundImageStyles(owner) : {};
    const textVisibility = isReadonly && owner !== UNKNOWN ? 'invisible' : ''

    return (
      <div
        className={`flex justify-center md:flex rounded-lg p-6 sm:py-8 py-16 shadow-2xl ${backgroundColor} ${pointerClass}`}
        onClick={onClick}
        style={styles}
      >
        <div className="md:text-left">
          <h2 className={`text-2xl break-all ${pointerClass} ${textClass} ${textVisibility}`}>{text}</h2>
        </div>
      </div>
    )
  }