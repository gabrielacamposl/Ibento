import React from 'react';
import Carousel from './carousel';
import Cards from './cards';
import SearchMenu from './menu';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Page(){


    const [eventos, setEventos] = useState([]);

    useEffect(() => {
      axios.get('http://127.0.0.1:8000/eventos/')
        .then(response => setEventos(response.data))
        .catch(error => console.error('Error:', error));
    }, []);

    return(
        <>
        <div className="flex flex-col gap-4 min-h-screen justify-center w-full items-center bg-white">
            <Carousel />
            <Cards listEvents = {eventos} />
            {/* <SearchMenu listEvents = {eventos}/> */}
            <div className='h-16'></div>
        </div>
        
        </>
    )

}

export default Page;