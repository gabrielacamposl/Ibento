// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";

import {
  HomeIcon as HomeOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftIcon as ChatOutline,
  FaceSmileIcon as FaceSmileOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  UserIcon as UserSolid,
  ChatBubbleLeftIcon as ChatSolid,
  FaceSmileIcon as FaceSmileSolid,
} from "@heroicons/react/24/solid";

function BottomNav() {
    const navItems = [
    { 
      path: '/ibento/eventos', 
      OutlineIcon: HomeOutline, 
      SolidIcon: HomeSolid
    },
    { 
      path: '/ibento/matches', 
      OutlineIcon: FaceSmileOutline, 
      SolidIcon: FaceSmileSolid
    },
    { 
      path: '/ibento/match', 
      OutlineIcon: ChatOutline, 
      SolidIcon: ChatSolid
    },
    { 
      path: '/ibento/perfil', 
      OutlineIcon: UserOutline, 
      SolidIcon: UserSolid
    }
  ];

  const gradient = 'from-blue-500 to-purple-600';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/ibento/eventos'}
            className="flex flex-col items-center p-3 rounded-2xl transition-all duration-200 group"
          >
            {({ isActive }) => (
              <>
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r ${gradient}` 
                    : 'group-hover:bg-gray-50'
                  }
                `}>
                  {isActive ? (
                    <item.SolidIcon className="w-6 h-6 text-white" />
                  ) : (
                    <item.OutlineIcon className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
                  )}
                </div>
                
                {/* Indicador minimalista */}
                {isActive && (
                  <div className={`
                    w-1 h-1 rounded-full mt-1 
                    bg-gradient-to-r ${gradient}
                  `}></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
