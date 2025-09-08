import React from 'react';

const SkeletonLoader: React.FC = () => {
    return (
        <div className="w-full animate-pulse space-y-6 p-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-4/6"></div>
                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
