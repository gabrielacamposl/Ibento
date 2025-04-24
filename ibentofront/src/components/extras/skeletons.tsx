import React from 'react';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';


  export function CardSkeleton() {
    return (
    
        <div
            className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
        >
            <div className="bg-white rounded-lg p-1 h-auto w-full drop-shadow-xl flex flex-row ">
                <div className="w-full rounded-lg flex flex-row">
                    <div className='rounded-lg bg-gray-200 w-40 h-40'></div>
                </div>
                <div className='flex flex-col justify-center px-6 gap-2'>
                    <div className='rounded-lg bg-gray-200 h-7 w-20'></div>
                    <div className='rounded-lg bg-gray-200 h-7 w-20'></div>
                    <div className='rounded-lg bg-gray-200 h-7 w-20'></div>
                </div>
            </div>
        </div>

    );
  }

  export function CardsSkeleton() {
    return (
      <>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    );
  }