import clsx from "clsx";

export const inputStyles = clsx(
  "mt-1 w-full rounded-3xl bg-white border border-purple-600",
  "focus:border-purple-500 focus:outline-none p-1 ",
  "w-full flex justify-center items-center",
  "text-black" 
);

// Modern glassmorphism input style
export const inputStylesGlass = clsx(
  "w-full h-12 px-4 bg-transparent border-0 outline-none",
  "glass-premium rounded-2xl",
  "placeholder-gray-500 text-gray-900 font-medium",
  "transition-all duration-300",
  "focus:ring-2 focus:ring-purple-400/50 focus:shadow-xl",
  "hover:shadow-lg"
);

export const buttonStyle = clsx(
"w-full flex justify-center items-center",
"rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white",
"font-bold shadow-lg hover:text-purple hover:bg-white px-12 py-1 text-l"
);

export const buttonAccept = clsx(
  "w-20 flex justify-center items-center",
  "rounded-full bg-gradient-to-r from-purple-800 via-purple-600 to-purple-400 text-white",
  "font-bold shadow-lg hover:text-purple hover:bg-white px-12 py-3 text-sm font-light"
)

export const buttonStyleCategoria = clsx(
  "w-full  justify-start items-center",
  "rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold",
  "font-bold shadow-lg hover:text-purple hover:bg-white px-8 py-1 text-l"
  );

export const buttonStyleSecondary = clsx(
  "w-full flex justify-center items-center",
  " text-purple bg-white",
  );
  
export const buttonStyleBuscarMatch = clsx(
" flex justify-center p-3",
"rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white",
"font-bold shadow-lg hover:text-purple hover:bg-white  text-l mx-w-96 mt-0" );
export const verifyStyle = clsx(
    "text-purple-600",
    "text-sm"
    );
