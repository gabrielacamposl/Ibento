import React from 'react';

function Page() {
    return (
      <div className="min-h-screen w-screen justify-center items-center flex">
        <div className='md:w-1/3 min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100 overflow-x-hidden'>
            <div className="flex flex-col gap-4 items-center justify-center w-1/2 max-w-md px-4">
            <img
                src={"/ibento_logo.png"}
                className="w-1/2 h-1/2 p-4"
                alt="logo"
            />
            <h1 className="text-4xl font-bold text-black text-center">Recuperar Contraseña</h1>
            <p className="text-black py-5 text-center">
                Ingresa tu correo electrónico, te mandaremos un código para cambiar tu
                contraseña.
            </p>
            <div className="text-xl text-left text-black">Email</div>
            <input className="border-2 w-screen h-10 rounded-full border-purple-500 px-4 text-black md:w-full " />
            <button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white w-auto h-auto rounded-full mt-12">
                Enviar código
            </button>
            </div>
        </div>
      </div>
    );
  }
  
  export default Page;
  
  