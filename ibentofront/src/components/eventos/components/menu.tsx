import React from "react";
import { motion } from "framer-motion";
import CardWrapper from "./card";



interface ListEvent {
  _id: string;
  title: string;
  place: string;
  prices: string[];
  location: string;
  coordenates: string[];
  description: string;
  dates: string[];
  imgs: ([]);
  url: string;
  numLike: number;
  numSaves: number;
  distance: number
}

const Menu = () => {
  const [index, setIndex] = React.useState(0);

  const tabs = ["Próximos eventos", "Cercanos a mí", "Deportes", "Musicales"];

  return (
    <div className="w-full">
      {/* Container con glassmorphism */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl mx-4 mb-6 shadow-lg border border-white/30 overflow-hidden">
        
        {/* Background gradient sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-indigo-50/50"></div>
        
        {/* Tabs container */}
        <div className="relative flex flex-row text-sm items-center w-full h-auto p-2">
          {tabs.map((tab, i) => (
            <motion.button
              key={i}
              onClick={() => setIndex(i)}
              className={`
                relative flex-1 text-center py-3 px-2 rounded-xl transition-all duration-300 
                ${index === i 
                  ? "text-white font-semibold" 
                  : "text-gray-600 hover:text-gray-800 font-medium"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active tab background */}
              {index === i && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30,
                    duration: 0.3 
                  }}
                />
              )}
              
              {/* Tab text */}
              <span className="relative z-10 text-xs sm:text-sm font-medium">
                {tab}
              </span>
              
              {/* Hover effect for inactive tabs */}
              {index !== i && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
      </div>
      
      <CardWrapper name={tabs[index]} />
    </div>
  );
};

export default Menu;
