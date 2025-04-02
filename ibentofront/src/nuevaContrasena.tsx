import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function  RecoverPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password reset logic here
  };

  return (
    <div className="min-h-screen w-screen flex justify-center">
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100">
        <div className="flex flex-col w-full max-w-md px-6 pt-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={"/ibento_logo.png"}
              className="w-1/3 h-1/3 p-4"
              alt="logo"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-black mb-6 text-center">
            Recuperar Contraseña
          </h1>

          {/* Instructions */}
          <p className="text-gray-700 mb-8 text-center">
            Ingrese su nueva contraseña y confírmela
          </p>

          <form onSubmit={handleSubmit}>
            {/* Password input */}
            <div className="mb-4">
              <label className="text-gray-700 font-medium block mb-2">
                Contraseña:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-full text-black"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            <div className="mb-8">
              <label className="text-gray-700 font-medium block mb-2">
                Confirmar Contraseña:
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-full text-black"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-full mb-6"
            >
              Restablecer contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecoverPasswordPage;
