import React from 'react';
import Carousel from './carousel';
import Cards from './cards';
import SearchMenu from './menu';

function Page(){

    return(
        <>
        <div className="flex flex-col gap-4 min-h-screen justify-center w-full items-center bg-white">
            <Carousel />
            <Cards />
            <SearchMenu/>
            <div className='h-16'></div>
        </div>
        
        </>
    )

}

export default Page;