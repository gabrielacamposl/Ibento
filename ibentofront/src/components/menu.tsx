import React from 'react';

function SearchMenu(){
    return(
        <div className="flex justify-between px-4 text-sm">
        <button className="text-purple-700 font-medium border-b-2 border-purple-700 pb-1 g-2">
          Próximos eventos
        </button>
        <button className=" ">Cercanos a mí</button>
        <button className="text-gray-500">Culturales</button>
        <button className="text-gray-500">Musicales</button>
      </div>
    )

}

export default SearchMenu;