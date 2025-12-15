import React from 'react';

const SpamIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 0l-3.536 3.536m3.536-3.536l3.536 3.536M9.172 14.828L5.636 18.364m3.536-3.536l3.536 3.536m0 0l3.536-3.536m-3.536 3.536l-3.536-3.536M12 22a10 10 0 110-20 10 10 0 010 20z" />
  </svg>
);

export default SpamIcon;
