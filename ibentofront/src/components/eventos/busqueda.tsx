import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Search from "./Search";
import Cards from "./CategoryCard";
import EventWrapper from "./SearchCard";
import { CardsSkeleton } from "../extras/skeletons";
// import EventWrapperWParams from "./SearchCard2";
const EventWrapperWParams = React.lazy(() => import('./SearchCard2'));

function Page() {

    const [eventCount, setEventCount] = useState(null);

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden min-h-screen flex flex-col gap-1 items-center w-screen h-auto bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100">
        <div className="flex">
          <h3 id="titulo" className="mt-5 text-xl font-bold text-black text-left">Buscar</h3>
        </div>
        <div className="w-11/12">
          <Search placeholder="Buscar eventos..." />
        </div>
        <Suspense fallback={<CardsSkeleton />}>
        <EventWrapperWParams
          onResultCount={setEventCount}
        />
        </Suspense>
        {eventCount === 0 && (
        <>
          <div className="w-11/12">
            <Cards />
          </div>
          <div className="w-11/12">
            <EventWrapper />
          </div>
        </>
      )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-indigo-500 to-white">
        <Search placeholder="Buscar eventos..." />
      </div>
    </div>
  );
}

export default Page;
