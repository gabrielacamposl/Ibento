// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";

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
      isActive ? 
      "rounded-full bg-gradient-to-r from-blue-400 to-purple-500" : "text-gray-500 hover:text-gray-700"
    } transition-colors duration-200`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-lg">
      {/* Home Link */}
      <NavLink to="/ibento/eventos" end className={getNavLinkClass}>
      {isActive => isActive ? <HomeSolid className="mb-1 h-6 w-6" /> : <HomeOutline className="mb-1 h-6 w-6" />}
        {/* <HomeOutline className="mb-1 h-6 w-6" /> */}
      </NavLink>

      {/* Explore Link */}
      <NavLink to="/ibento/matches" className={getNavLinkClass}>
      {isActive => isActive ? <FaceSmileSolid className="mb-1 h-6 w-6" /> : <FaceSmileOutline className="mb-1 h-6 w-6" />}
        {/* <FaceSmileOutline className="mb-1 h-6 w-6" /> */}
      </NavLink>

      {/* Chat Link */}
      <NavLink to="/ibento/match" className={getNavLinkClass}>
      {isActive => isActive ? <ChatSolid className="mb-1 h-6 w-6" /> : <ChatOutline className="mb-1 h-6 w-6" />}
        {/* <ChatOutline className="mb-1 h-6 w-6" /> */}
      </NavLink>
      
      {/* Profile Link */}
      <NavLink to="/ibento/perfil" className={getNavLinkClass}>
      {isActive => isActive ? <UserSolid className="mb-1 h-6 w-6" /> : <UserOutline className="mb-1 h-6 w-6" />}
        {/* <UserOutline className="mb-1 h-6 w-6" /> */}
      </NavLink>
    </nav>
  );
}

export default BottomNav;
