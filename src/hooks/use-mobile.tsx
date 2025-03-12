
import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobileBreakpoint = 768; // Adjust this value based on your design requirements
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return { isMobile }; // Return an object with isMobile property instead of just the boolean
};

export default useMobile;
