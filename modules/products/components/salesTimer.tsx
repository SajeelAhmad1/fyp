import { useEffect, useState } from "react";

interface SalesTimerProps {
  endTime: string | null | undefined;
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
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 ${
        isMinimized ? 'w-14 h-14' : 'w-72'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-orange-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                Hurry up! Order now
              </h1>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold transition-colors duration-200 w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <div className="mb-3">
              <span className="text-xs font-medium text-gray-600 block">
                Deal ends in
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              {timeLeft.days > 0 && (
                <>
                  <div className="text-center">
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-lg font-bold min-w-[32px]">
                      {timeLeft.days}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">days</div>
                  </div>
                  <span className="text-gray-400 font-bold">:</span>
                </>
              )}
              <div className="text-center">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-lg font-bold min-w-[32px]">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 mt-1">hours</div>
              </div>
              <span className="text-gray-400 font-bold">:</span>
              <div className="text-center">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-lg font-bold min-w-[32px]">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 mt-1">mins</div>
              </div>
              <span className="text-gray-400 font-bold">:</span>
              <div className="text-center">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-lg font-bold min-w-[32px]">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 mt-1">secs</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};