
import React from 'react';

interface SpinnerProps {
  light?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ light = false }) => {
  const borderColor = light ? 'border-gray-100' : 'border-gray-700 dark:border-gray-300';
  const borderTopColor = light ? 'border-t-white' : 'border-t-blue-500 dark:border-t-blue-400';

  return (
    <div className={`w-5 h-5 border-2 ${borderColor} ${borderTopColor} border-solid rounded-full animate-spin`}></div>
  );
};

export default Spinner;
