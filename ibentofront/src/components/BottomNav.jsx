// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
// No necesitas importar './bottom-nav.css' si solo usas Tailwind,
// a menos que tengas estilos específicos allí.
// import './bottom-nav.css' 
import {
  MagnifyingGlassIcon as MGOutline,
  HomeIcon as HomeOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftIcon as ChatOutline,
  FaceSmileIcon as FaceSmileOutline,
} from "@heroicons/react/24/outline";

import {
  MagnifyingGlassIcon as MGSolid,
  HomeIcon as HomeSolid,
  UserIcon as UserSolid,
  ChatBubbleLeftIcon as ChatSolid,
  FaceSmileIcon as FaceSmileSolid,
} from "@heroicons/react/24/solid";

function BottomNav() {

  const getNavLinkClass = ({ isActive }) =>
    `flex flex-col items-center w-1/5 py-1 ${
      isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
    } transition-colors duration-200`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-lg">
      {/* Home Link */}
      <NavLink to="/prueba" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? (
              <HomeSolid className="mb-1 h-6 w-6" />
            ) : (
              <HomeOutline className="mb-1 h-6 w-6" />
            )}
            <span className="text-xs">Home</span>
          </>
        )}
      </NavLink>

      {/* Search Link */}
      <NavLink to="/prueba/evento" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? (
              <MGSolid className="mb-1 h-6 w-6" />
            ) : (
              <MGOutline className="mb-1 h-6 w-6" />
            )}
            <span className="text-xs">Search</span>
          </>
        )}
      </NavLink>

      {/* Chat Link */}
      <NavLink to="/prueba/evento" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? (
              <ChatSolid className="mb-1 h-6 w-6" />
            ) : (
              <ChatOutline className="mb-1 h-6 w-6" />
            )}
            <span className="text-xs">Chat</span>
          </>
        )}
      </NavLink>

      {/* Explore Link */}
      <NavLink to="/prueba/evento" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? (
              <FaceSmileSolid className="mb-1 h-6 w-6" />
            ) : (
              <FaceSmileOutline className="mb-1 h-6 w-6" />
            )}
            <span className="text-xs">Explore</span>
          </>
        )}
      </NavLink>

      {/* Profile Link */}
      <NavLink to="/prueba/evento" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? (
              <UserSolid className="mb-1 h-6 w-6" />
            ) : (
              <UserOutline className="mb-1 h-6 w-6" />
            )}
            <span className="text-xs">Profile</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}

export default BottomNav;
