
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';

interface ListEvent {
    _id: string;
    title: string;
    place: string;
    price: [];
    location: string;
    coordenates: [];
    description: string;
    dates: [];
    imgs: [];
    url: string;
    numLike: number;
    numSaves: number;
}

interface CircularDemoProps {
    listEvents: ListEvent[];
}

export default function CircularDemo({ listEvents }: CircularDemoProps) {
    const navigate = useNavigate();
    
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
    ];    const productTemplate = (product) => {
        const handleEventClick = () => {
            const url = `../eventos/${product._id}`;
            navigate(url);
        };

        return (
            <div 
                className='relative rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200'
                onClick={handleEventClick}
            >
                <img src={product.imgs[0]} alt={product.title} className="w-full h-72 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-lg"></div>
                
                {/* Información del evento superpuesta */}
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold truncate max-w-xs">{product.title}</h3>
                    <p className="text-sm opacity-90">{product.place}</p>
                </div>
            </div>
        );
    };    return (
        <div className="card">
            <Carousel 
                value={listEvents} 
                numVisible={1} 
                numScroll={5} 
                responsiveOptions={responsiveOptions} 
                className="custom-carousel rounded-lg w-full" 
                circular
                autoplayInterval={3000} 
                itemTemplate={productTemplate} 
            />
        </div>
    )
}
        