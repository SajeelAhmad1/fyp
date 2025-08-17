import React from 'react';

interface StarProps {
  count: number;
}

// const Star: React.FC<StarProps> = ({ count }) => {

const StarNew: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage =
          Math.max(0, Math.min(1, count - (star - 1))) * 100;

        return (
          <div key={star} className="relative w-5 h-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 24 24"
              stroke="#FF9B00"
              fill="#FF9B00"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <div
              className="absolute top-0 left-0 h-full"
              style={{ width: `${fillPercentage}%`, overflow: "hidden" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                viewBox="0 0 24 24"
                fill="#FF9B00"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default StarNew;
