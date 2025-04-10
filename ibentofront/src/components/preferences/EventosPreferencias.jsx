import { useEffect, useState,  useRef  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toast } from 'primereact/toast';
import {
    Paper,
    Box,
    Grid,
    Typography,
    CssBaseline,
    Container
} from "@mui/material";
import { Button } from "primereact/button";
import { buttonStyle, inputStyles } from "../../styles/styles";
import { motion } from "framer-motion";


const colors = ["#FF00FF", "#00FFFF", "#FFFFFF"];

const EventosPreferencias = () => {

    const [categorias, setCategorias] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    const usuarioId = localStorage.getItem("usuario_id");
    const token = localStorage.getItem("token");

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/api/categorias/')
            .then(response => {
                const categoriasFormateadas = response.data.map(cat => ({
                    id: cat._id,
                    nombre: cat.nombre,
                    valores: cat.subcategorias.map(sub => sub.nombre_subcategoria)
                }));
                setCategorias(categoriasFormateadas);
            })
            .catch(error => {
                console.error('Error cargando categorías:', error);
            });
    }, []);

    const toggleSeleccionado = (valor) => {
        setSeleccionados((prevSeleccionados) =>
            prevSeleccionados.includes(valor)
                ? prevSeleccionados.filter((item) => item !== valor)
                : [...prevSeleccionados, valor]
        );
    };


    
    return (

          <div className="h-screen flex justify-center items-center">
              {/* Formulario para la visualización web  */}
        
              <motion.div
                className="hidden md:block relative w-full h-screen flex justify-center items-center overflow-hidden "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 "></div>
                <div className="absolute inset-0 z-10">
        
                  {/* Luces flotantes */}
                  {[...Array(9)].map((_, i) => {
                    const color = colors[i % colors.length]; // Alterna entre los 3 colores
        
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-40 h-40 opacity-30 blur-xl rounded-full"
                        style={{ backgroundColor: color }} // Aplica el color dinámicamente
                        initial={{
                          x: Math.random() * window.innerWidth,
                          y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                          x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                          y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                        }}
                        transition={{
                          duration: 8 + Math.random() * 4,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}
                </div>
                <Box
                  sx={{
                    height: "80vh",
                    width: "90vw",
                    maxWidth: 420,
                    zIndex: 10,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflowY: "auto",
                    bgcolor: "background.default",
                    padding: 2,
                  }}
                >
                  <Container
                    component="main"
                    maxWidth="xs"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      backgroundColor: "white",
                      boxShadow: 3,
                      p: 4,
                      zIndex: 20,
                      borderRadius: 2,
                    }}
                  >
                    <CssBaseline />
                    <Typography variant="h5" component="h1" sx={{ textAlign: "center", mb: 2 }}>
                      Crear Cuenta
                    </Typography>
                    <Grid container spacing={2}>
                    <div className="intereses-container">
                    {categorias.map((categoria) => (
                        <div key={categoria.id} className="categoria mb-5">
                            {/* Categoría - estilo con degradado */}
                            <div
                                className="btn-custom text-white font-bold text-lg inline-block rounded-full px-4 py-2 mb-2 ml-2 mt-4 shadow"
                                style={{ cursor: 'default' }}
                            >
                                {categoria.nombre}
                            </div>

                            {/* Subcategorías */}
                            <ul className='flex flex-wrap'>
                                {categoria.valores.map((valor) => (
                                    <li
                                        key={valor}
                                        className={`cursor-pointer mt-2 text-center px-4 py-1 ml-2 rounded-full font-medium transition 
                                            ${seleccionados.includes(valor)
                                                ? 'bg-purple-400 text-white shadow'
                                                : 'btn-off'
                                            }`}
                                        onClick={() => toggleSeleccionado(valor)}
                                    >
                                        {valor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                </Grid>
                 <Button className={buttonStyle} type="submit" 
                                variant="contained" sx={{ mt: 3, mb: 2 }}
                                >
                                 Siguiente
                                </Button>
                  </Container>
                </Box>
              </motion.div>
        
        
              {/* Formulario para móviles */}
              <div className="block md:hidden">
        
                <div className="block md:hidden w-full h-screen flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-300 via-purple-300 to-transparent z-10"></div>
                  <div className="absolute inset-0 z-10">
                    {[...Array(9)].map((_, i) => {
                      const color = colors[i % colors.length]; // Alterna entre colores
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-30 h-30 opacity-30 blur-xl rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight / 2, // Solo en la parte superior
                          }}
                          animate={{
                            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                            y: [Math.random() * window.innerHeight / 2, Math.random() * window.innerHeight / 2],
                          }}
                          transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                          }}
                        />
                      );
                    })}
                  </div>
                  {/* Logo */}
                  <img src="/logo.png" alt="Logo" className="w-16 h-16 z-20" />
        
                </div>
        
                {/* Contenedor del formulario */}
                <Box
                  className="bg-white rounded-t-3xl shadow-lg flex justify-center items-start p-6"
                  sx={{
                    width: "100%",
                    zIndex: 10,
                  }}
                >
                  <Grid container component="main" maxWidth="xs" className="w-full h-full">
                    <CssBaseline />
                    <Typography variant="h5" component="h1" className="text-center font-bold text-gray-700 mb-4">
                      Crear Cuenta
                    </Typography>
                    <div className="intereses-container">
                    {categorias.map((categoria) => (
                        <div key={categoria.id} className="categoria mb-5">
                            {/* Categoría - estilo con degradado */}
                            <div
                                className="btn-custom text-white font-bold text-lg inline-block rounded-full px-4 py-2 mb-2 ml-2 mt-4 shadow"
                                style={{ cursor: 'default' }}
                            >
                                {categoria.nombre}
                            </div>

                            {/* Subcategorías */}
                            <ul className='flex flex-wrap'>
                                {categoria.valores.map((valor) => (
                                    <li
                                        key={valor}
                                        className={`cursor-pointer mt-2 text-center px-4 py-1 ml-2 rounded-full font-medium transition 
                                            ${seleccionados.includes(valor)
                                                ? 'bg-purple-400 text-white shadow'
                                                : 'btn-off'
                                            }`}
                                        onClick={() => toggleSeleccionado(valor)}
                                    >
                                        {valor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                   
                  </Grid>
                </Box>
              </div>
            </div>
    );
};

export default EventosPreferencias;