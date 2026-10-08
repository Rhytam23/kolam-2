import React from 'react';

/**
 * The border bar of the page's art form (the kaavi-and-white stripe of a temple wall for kolam, the red
 * border of a white sari for alpana, a kasavu gold border for pookalam, and so on). Its look is set in
 * index.css from the art form on <html>; pages of no one art form show none.
 */
const FrameBar: React.FC<{ className?: string }> = ({ className = '' }) => <div className={`culture-bar ${className}`} aria-hidden />;

export default FrameBar;
