import React, { useState } from 'react';
import "../../assets/css/botones.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { buttonStyle, inputStyles,verifyStyle } from "../../styles/styles";
import { ReplyAll } from 'lucide-react';
const repeat = () => {
    const navigate = useNavigate();
  
        
    return (
        <div className="justify-center text-black flex   min-h-screen ">
            <div className="degradadoPerfil flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-[#F2F2F2] to-[#E6E6E6]">
                <h1 className="text-3xl font-bold mb-4">Error</h1>
                <div className={verifyStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-18">
  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>

                </div>
                <p className="mt-4 text-lg mb-4 text-center p-3">Lo sentimos, este usuario ya ha sido verificado previamente.
                    En caso de que considere que esto es un error, contactenos al siguiente correo:
                    <span className='font-bold'>   atencionCliente@ibentoapp.com</span>
 </p>
            
                <div className="">
                <Link to="../eventos">
                    <button className={buttonStyle}>Continuar</button>
                </Link>
                </div>
              </div> 
            </div>
       
    );
}

export default repeat;
