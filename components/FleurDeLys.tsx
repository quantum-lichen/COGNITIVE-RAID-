import React from 'react';

interface FleurDeLysProps {
  className?: string;
}

export const FleurDeLys: React.FC<FleurDeLysProps> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C12 2 8 6 8 9C8 11.5 9.5 13 11 13.5V16C9 16 6 14 6 11C6 9 5 8 4 8C3 8 2 9 2 11C2 15 5 17 8 18V21C6 21.5 5 22 5 22H19C19 22 18 21.5 16 21V18C19 17 22 15 22 11C22 9 21 8 20 8C19 8 18 9 18 11C18 14 15 16 13 16V13.5C14.5 13 16 11.5 16 9C16 6 12 2 12 2ZM12 6C13 6 13.5 8 13.5 9C13.5 10 13 11 12 11C11 11 10.5 10 10.5 9C10.5 8 11 6 12 6Z" />
  </svg>
);