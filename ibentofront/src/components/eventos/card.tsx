
import React from 'react';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';


export default function CardWrapper() {
    
    const imgs = ["imgIcon.jpeg", "imgIcon2.jpeg", "imgIcon3.jpeg", "imgIcon4.png", "imgIcon.jpeg", "imgIcon2.jpeg", "imgIcon3.jpeg", "imgIcon4.png"];
    const titles = ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6", "Title 7", "Title 8"];

    return (
        <>
        <div className='overflow-y-scroll'>
            <div className="flex flex-row flex-wrap items-center justify-center py-2 gap-4 ">
                {imgs.map((img, index) => (
                    console.log(img),
                    <Card key={index} img={img} title={titles[index]} index={index} />
                ))}
            </div>
        </div>
        
        </>
        
    );
}

export function Card({
    img, 
    title,
    index 
    }: {
    img: string;
    title: string;
    index: number;
    }) {

    const url = "../eventos/" + index;
    return (
        <Link to={url} className="bg-white rounded-lg flex-col flex-none p-2 h-72 w-48 drop-shadow-xl ">
            <img
            src={`/${img}`}
            className="rounded-lg object-cover w-full h-48" 
            alt={title}/>
            <h2 className="text-xl font-medium text-black text-left">{title}</h2>

            <div className='flex flex-row items-center justify-center space-x-2'>
                <div className='flex space-x-2 items-center justify-center'>
                    <HeartIcon className='h-8 w-8 text-black' />
                    <p className='text-black'>1.5mil</p>
                    <ClockIcon className='h-6 w-6 text-black' />
                    <p className='text-black'>En 6 dias</p>
                </div>
            </div>   
        </Link>
        
    );
}

export function Pictures(){

}