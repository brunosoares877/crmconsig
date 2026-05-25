
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delayBeforeDelete?: number;
  delayBeforeType?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 100,
  delayBeforeDelete = 2000,
  delayBeforeType = 500
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setLoopCount(loopCount + 1);
        timer = setTimeout(() => {}, delayBeforeType);
      } else {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, speed / 2);
      }
    } else {
      if (displayText.length === text.length) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDelete);
      } else {
        timer = setTimeout(() => {
          setDisplayText(text.slice(0, displayText.length + 1));
        }, speed);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, text, speed, delayBeforeDelete, delayBeforeType, loopCount]);

  return (
    <span className="relative">
      <span>{displayText}</span>
      <span className="absolute right-[-2px] top-0 animate-pulse">|</span>
    </span>
  );
};

export default TypewriterText;
