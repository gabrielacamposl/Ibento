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
      <div className="relative flex flex-row text-sm items-center w-full h-auto p-2">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`flex-1 text-center ${
              index === i ? "text-purple-700 font-medium" : "text-black"
            }`}
          >
            {tab}
          </button>
        ))}

        {/* Subrayado animado */}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-purple-700"
          layout
          initial={false}
          animate={{
            width: `${103 / tabs.length}%`,
            x: `${index * (365 / tabs.length)}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      
      <CardWrapper name={tabs[index]} />

    </div>
  );
};

export default Menu;
