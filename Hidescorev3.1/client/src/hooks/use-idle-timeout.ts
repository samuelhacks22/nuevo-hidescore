import { useEffect, useRef } from 'react';

export function useIdleTimeout(timeout: number, onTimeout: () => void) {
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const handleActivity = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(onTimeout, timeout);
        };

        // Initial timer start
        handleActivity();

        // Event listeners
        const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [timeout, onTimeout]);
}
