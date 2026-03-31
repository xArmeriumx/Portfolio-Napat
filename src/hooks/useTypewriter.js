import { useState, useEffect } from 'react';

/**
 * Custom hook to simulate a typewriter typing effect.
 * @param {string} text - The full text to type out.
 * @param {number} speed - The speed in ms per character (default 15).
 * @param {boolean} shouldType - Whether to start typing.
 */
export function useTypewriter(text, speed = 15, shouldType = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!shouldType || !text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    
    // Turbo speed for long texts so user doesn't fall asleep
    const dynamicSpeed = text.length > 800 ? 5 : speed;

    const intervalId = setInterval(() => {
      if (index < text.length) {
        // Safe slice based on closure index
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, dynamicSpeed);

    return () => clearInterval(intervalId);
  }, [text, speed, shouldType]);

  const skipTyping = () => {
    setDisplayedText(text);
    setIsTyping(false);
  };

  return { displayedText, isTyping, skipTyping };
}
