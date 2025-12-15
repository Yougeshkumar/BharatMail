import React from 'react';

const UnorderedListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="4" cy="6" r="1" stroke="none" fill="currentColor" transform="translate(-1.5, 0)" />
        <circle cx="4" cy="12" r="1" stroke="none" fill="currentColor" transform="translate(-1.5, 0)" />
        <circle cx="4" cy="18" r="1" stroke="none" fill="currentColor" transform="translate(-1.5, 0)" />
    </svg>
);

export default UnorderedListIcon;
