import React from 'react';
import Carousel from './components/carousel';
import Cards from './components/cards';
import CardWrapper from './components/card';
import SearchMenu from './components/menu';
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