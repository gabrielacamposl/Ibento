import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { inputStyles } from '../../../styles/styles';
import { InputText } from "primereact/inputtext";

export default function Search({ placeholder }: { placeholder: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(searchParams)
  const location = useLocation();
  console.log(location)
  const navigate = useNavigate();

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);

    // Crear una nueva instancia de URLSearchParams basada en los parámetros actuales
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // Actualizar la URL con los nuevos parámetros de búsqueda
    navigate(`${location.pathname}?${params.toString()}`);
  }, 300);

  return (

      <div className='relative'>
        <InputText
          className={`${inputStyles} text-black`}
          placeholder={placeholder}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={searchParams.get('query') || ''}
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>
  );
}
