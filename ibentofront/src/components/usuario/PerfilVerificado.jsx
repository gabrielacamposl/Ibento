import React, { useState } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
import { buttonStyle, inputStyles,verifyStyle } from "../../styles/styles";
const matches = () => {
    const navigate = useNavigate();
  
        
    return (
        <div className="justify-center text-black flex   min-h-screen ">
            <div className="degradadoPerfil flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-[#F2F2F2] to-[#E6E6E6]">
                <h1 className="text-3xl font-bold mb-4">Perfil Verificado</h1>
                <div className={verifyStyle}>
                <svg className='' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                </div>
                <p className="mt-4 text-lg mb-4">¡Muchas gracias! Tú perfil está verificado.</p>
            
                <div className="">
                <Link to="../matches">
                    <button className={buttonStyle}>Continuar</button>
                </Link>
                </div>
              </div> 
            </div>
       
    );
}

export default matches;
