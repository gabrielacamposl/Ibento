import React from 'react';
import Carousel from './carousel';
import Cards from './cards';
import CardWrapper from './card';
import SearchMenu from './menu';

function Page(){

    return(
        <>
        <div className="flex flex-col gap-4 min-h-screen items-center bg-white">
            <Carousel />
            <Cards />
            <SearchMenu/>
            <CardWrapper />
        </div>
        
        </>
    )

}

export default Page;