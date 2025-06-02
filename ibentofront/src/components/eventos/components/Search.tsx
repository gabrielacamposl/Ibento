import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFocused, setIsFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    navigate(`${location.pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 h-4 w-4 text-gray-500" />
        <input
          type="text"
          className="w-full h-10 pl-10 pr-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 outline-none placeholder-gray-500 text-gray-900 transition-all duration-300 focus:bg-white/60 hover:bg-white/50"
          placeholder={placeholder}
          defaultValue={searchParams.get('query') || ''}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
