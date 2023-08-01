import React from 'react';
import { pastelColour } from '../atoms/Kanban';

export function generateAvatar(userName?: string) {
  if (!userName) {
    return undefined;
  }
  const initalA = userName.split(' ')[0][0];
  const initalB = userName.split(' ')[1][0];
  const initals = initalA + initalB;

  const background = pastelColour('#ffffff');

  const svg = (
    <svg height="124" width="124">
      <circle cx="62" cy="62" r="62" fill={background[0]}></circle>
      <text fill="#ffffff" fontSize="50" textAnchor="middle" x="62" y="78">
        {initals}
      </text>
    </svg>
  );
  return svg;
}
