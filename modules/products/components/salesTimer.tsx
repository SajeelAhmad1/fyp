import { useEffect, useState } from "react";

interface SalesTimerProps {
  endTime: string | null;
}

export const SalesTimer = ({ endTime }: SalesTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const saleEnd = new Date(endTime).getTime();
      const difference = saleEnd - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!endTime || timeLeft.isExpired) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-4 z-50">
      <div className={`bg-white border border-gray-300 rounded-md shadow-md transition-all duration-200 ${
        isMinimized ? 'w-10 h-10' : 'w-48'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-orange-600 hover:bg-gray-50 rounded-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Deal ends in</span>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              {timeLeft.days > 0 && (
                <>
                  <span className="font-bold text-red-600">{timeLeft.days}d</span>
                  <span className="text-gray-400">:</span>
                </>
              )}
              <span className="font-bold text-red-600">{timeLeft.hours.toString().padStart(2, '0')}h</span>
              <span className="text-gray-400">:</span>
              <span className="font-bold text-red-600">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
              <span className="text-gray-400">:</span>
              <span className="font-bold text-red-600">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};