import React from 'react';

function VerificationCodePage() {
    return (
      <div className="min-h-screen w-screen flex justify-center">
        <div className='md:w-1/3 min-h-screen justify-center items-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100'>

        <div className="flex flex-col justify-center items-center w-full px-6 pt-10 ">
        <img
                src={"/ibento_logo.png"}
                className="w-1/3 h-1/3 p-4"
                alt="logo"
            />
          {/* Title */}
          <h1 className="text-2xl font-bold text-black mb-10">
            Recuperar contraseña
          </h1>
  
          {/* Instructions */}
          <p className="text-gray-700 mb-8">
            Ingresa el código que hemos a tu correo electrónico:
          </p>
  
          <div className="mb-2">
            <label className="text-gray-700 font-medium">
              Código de para recuperación de contraseña:
            </label>
          </div>
          
          <button className=" text-purple-500 text-sm py-2 px-4 rounded-md mb-6">
            Enviar código nuevo
          </button>
  
          {/* Code input boxes */}
          <div className="flex justify-between gap-1 mb-20">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-12 h-12 md:h-20 md:w-20 text-black border-2 border-purple-300 rounded-lg text-center text-xl"
              />
            ))}
          </div>
  
          {/* Submit button */}
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 md:text-lg rounded-full">
            Enviar
          </button>
        </div>
      </div>

        </div>
    );
  }
  
  export default VerificationCodePage;
  