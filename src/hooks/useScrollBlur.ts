import { useState, useEffect } from 'react';

const useScrollBlur = (maxBlur = 10, maxScroll = 300) => {
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const calculatedBlur = Math.min((scrollTop / maxScroll) * maxBlur, maxBlur);
      setBlur(calculatedBlur);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [maxBlur, maxScroll]);

  return blur;
};

export default useScrollBlur;
