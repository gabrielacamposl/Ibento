import React from 'react';
import { useState } from 'react';
import './carousel.css';


const Carousel = () => {

  const populares = [
    {
        id: "ECIP1-1",
        title: "Populares 1: League of legends Finals",
        img: "lolicon.jpeg",
        fecha: "2025-04-27",
        numLikes: 1500,
    },
    {
        id: "ECIP1-2",
        title: "Populares 2: Morat",
        img: "moraticon.jpg",
        fecha: "2025-05-05",
        numLikes: 1000000,

    },
    {
        id: "ECIP1-3",
        title: "Populares 3: The Bities",
        img: "btsicon.jpg",
        fecha: "2025-06-12",
        numLikes: 10000,
    },
    {
        id: "ECIP1-4",
        title: "Populares 4: Harry Styles todo precioso",
        img: "harryicon.jpg",
        fecha: "2025-04-21",
        numLikes: 250,
    }
];

    return (
        <div className="carousel rounded-box max-h-72">
        {populares.map((event, index) => (
            console.log(index),
            <div className="carousel-item w-full relative h-92 animacion-deslizamiento">
              <img
                src={`/${event.img}`}
                className="w-full h-92"
                alt="Tailwind CSS Carousel component" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black to-transparent"></div>
            </div>
        ))}

        
        <div className="carousel-item w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
            className="w-full"
            alt="Tailwind CSS Carousel component" />
        </div>
        <div className="carousel-item w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
            className="w-full"
            alt="Tailwind CSS Carousel component" />
        </div>
        <div className="carousel-item w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp"
            className="w-full"
            alt="Tailwind CSS Carousel component" />
        </div>
        <div className="carousel-item w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.webp"
            className="w-full"
            alt="Tailwind CSS Carousel component" />
        </div>
        <div className="carousel-item w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp"
            className="w-full"
            alt="Tailwind CSS Carousel component" />
        </div>
        <div className="carousel-item w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.webp"
            className="w-full"
            alt="Tailwind CSS Carousel component" />
        </div>
      </div> 
    )
};

export default Carousel;
