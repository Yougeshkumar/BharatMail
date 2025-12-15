import React from 'react';

const MinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v4H4m12-4v4h4M8 20v-4H4m12 4v-4h4" />
    </svg>
);

export default MinimizeIcon;
