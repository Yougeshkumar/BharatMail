import React from 'react';

const BlockquoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l4-4-4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15l4-4-4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l4-4-4-4" />
        <rect x="3" y="5" width="2" height="14" stroke="none" fill="currentColor" />
    </svg>
);

export default BlockquoteIcon;
