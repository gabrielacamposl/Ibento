
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import { useFetchEvents } from '../../../hooks/usefetchEvents';



export default function CircularDemo() {

    const { data: popularEvents, loading: popularLoading, error: popularError } = useFetchEvents('eventos/most_liked/');
    
    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    const productTemplate = (product) => {
        return (
            <div className='relative rounded-lg'>
                <img src={product.imgs[0]} alt={product.title} className="w-full h-72 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-lg"></div>
            </div>
        );
    };

    return (
        <div className="card">
            <Carousel value={popularEvents} numVisible={1} numScroll={5} responsiveOptions={responsiveOptions} className="custom-carousel rounded-lg w-full" circular
            autoplayInterval={3000} itemTemplate={productTemplate} />
        </div>
    )
}
        