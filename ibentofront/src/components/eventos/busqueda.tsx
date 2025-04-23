import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Search from './Search';
import Cards from './CategoryCard';
import EventWrapper from './SearchCard'




function Page() {

    return(

        <div className='w-full'>

            {/* Mobile View */}
            <div className='md:hidden min-h-screen flex flex-col items-center w-screen h-auto bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100'>

                <div className='mt-10 w-11/12'>
                    <Search placeholder="Buscar eventos..." />
                </div>

                <div className='mt-10 w-11/12'>
                    <Cards />
                </div>
                <div className='mt-10 w-11/12'>
                    <EventWrapper />
                </div>
                
                

            </div>

            {/* Desktop View */}
            <div className='hidden md:flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-indigo-500 to-white'>
        
                <Search placeholder="Buscar eventos..." />

            </div>

        </div>

    );


}

export default Page;
