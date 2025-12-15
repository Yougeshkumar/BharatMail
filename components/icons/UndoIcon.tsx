import React from 'react';

const UndoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-6-6m0 0l6-6m-6 6h12a6 6 0 010 12h-3" />
    </svg>
);

export default UndoIcon;
