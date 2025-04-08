import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toast } from 'primereact/toast';
import {
    Paper,
    Box,
    Grid,
    Typography,
    CssBaseline,
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

    // Cargar las categorías con axios
    useEffect(() => {
        axios.get("http://localhost:8000/preferencias-eventos/categorias-con-subcategorias/")
            .then((response) => {
                setCategorias(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al cargar categorías", err);
                setLoading(false);
            });
    }, []);

    // Función para alternar selección de subcategorías
    const toggleSeleccionado = (valor) => {
        setSeleccionados((prev) =>
            prev.includes(valor) ? prev.filter((item) => item !== valor) : [...prev, valor]
        );
    };

    // Guardar preferencias usando axios
    const guardarPreferencias = () => {
        const subcategoriasSeleccionadas = categorias.flatMap((categoria) =>
            categoria.subcategorias
                .filter((sub) => seleccionados.includes(sub.nombre_subcategoria))
                .map((sub) => sub._id)
        );

        // Realizar la solicitud PUT con axios
        axios.put(`http://localhost:8000/usuarios/${usuarioId}/preferencias/`,
            { preferencias_evento: subcategoriasSeleccionadas },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // Usar el token de autenticación
                }
            })
            .then((response) => {
                // Mostrar el Toast con el mensaje de éxito
                toast.current.show({
                    severity: 'success',
                    summary: 'Preferencias guardadas',
                    detail: 'Tus preferencias de eventos se han actualizado con éxito.',
                    life: 3000,  // Toast desaparece después de 3 segundos
                });
            })
            .catch((err) => {
                console.error("Error al guardar preferencias:", err);
            });
    }


    return (

        <div className="h-screen flex justify-center items-center">
            <Toast ref={toast} />

            {/* Formulario para la visualización web  */}
            <div className="hidden md:block relative w-full h-screen flex justify-center items-center overflow-hidden ">
                <Grid container component="main" sx={{ height: "100vh", width: "100vw" }}>
                    <CssBaseline />
                    {/* Animación */}
                    <Grid item xs={false} sm={4} md={7} sx={{ position: "relative", overflow: "hidden" }}>
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(135deg,rgba(136, 174, 255, 0.87) 0%,rgb(229, 152, 255) 100%)",
                            }}
                        />


                        {[...Array(10)].map((_, i) => {
                            const color = colors[i % colors.length];

                            return (
                                <motion.div
                                    key={i}
                                    className="absolute w-40 h-40 opacity-30 blur-2xl rounded-full"
                                    style={{ backgroundColor: color }}
                                    initial={{
                                        x: Math.random() * window.innerWidth,
                                        y: Math.random() * window.innerHeight,
                                    }}
                                    animate={{
                                        x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                                        y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                                    }}
                                    transition={{
                                        duration: 10 + Math.random() * 5,
                                        repeat: Infinity,
                                        repeatType: "mirror",
                                        ease: "easeInOut",
                                    }}
                                />
                            );
                        })}
                    </Grid>
                    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                        <Box sx={{
                            my: 8,
                            mx: 4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            maxHeight: "80vh",  // Añadido para limitar la altura
                            overflowY: "auto",  // Añadido para permitir el scroll vertical
                        }}>

                            <Typography component="h1" variant="h5" sx={{ mt: 2, fontFamily: "Aptos, sans-serif", fontWeight: "bold" }}>
                                ¿Qué tipo de eventos te gustan?
                            </Typography>
                            <Box sx={{ mt: 1 }}>

                                <Grid item xs={12} container justifyContent="center" alignItems="center">

                                    <div className="intereses-container">
                                        {categorias.map((categoria) => (
                                            <div key={categoria._id} className="categoria mb-5">
                                                <h3 className='font-bold text-2xl'> {categoria.nombre}</h3>
                                                <ul className='flex flex-wrap'>
                                                    {categoria.subcategorias.map((sub) => (
                                                        <li
                                                            key={sub._id}
                                                            className={`${seleccionados.includes(sub.nombre_subcategoria) ? 'seleccionado btn-custom' : 'btn-off'} mt-2 text-center px-4 ml-2 rounded-full`}
                                                            onClick={() => toggleSeleccionado(sub.nombre_subcategoria)}
                                                        >
                                                            {sub.nombre_subcategoria}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}


                                    </div>

                                </Grid>


                                <Button onClick={guardarPreferencias}
                                    className={buttonStyle} type="button"
                                    fullWidth variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Guardar
                                </Button>

                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </div>

            {/* Formulario para la visualización móvil */}
            <div className="block md:hidden relative w-full h-screen flex justify-center items-center overflow-hidden">
                {/* Fondo con degradado */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-400 via-purple-200 to-transparent z-0"></div>

                <div className="h-screen flex justify-center items-center bg-gray-100 relative z-10">
                    <Grid container component="main" sx={{ height: "100vh", width: "100vw" }}>
                        <Grid item xs={12} component={Paper} elevation={6} square sx={{ borderRadius: 4, p: 3 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", }}>
                                <Typography component="h1" variant="h5" sx={{ mt: 2, fontFamily: "Aptos, sans-serif", fontWeight: "bold" }}>
                                    ¿Qué tipo de eventos te gustan?
                                </Typography>
                                <Box sx={{ mt: 1 }}>

                                    <Grid item xs={12} container justifyContent="center" alignItems="center">

                                        <div className="intereses-container">
                                            {categorias.map((categoria) => (
                                                <div key={categoria._id} className="categoria mb-5">
                                                    <h3 className='font-bold text-2xl'> {categoria.nombre}</h3>
                                                    <ul className='flex flex-wrap'>
                                                        {categoria.subcategorias.map((sub) => (
                                                            <li
                                                                key={sub._id}
                                                                className={`${seleccionados.includes(sub.nombre_subcategoria) ? 'seleccionado btn-custom' : 'btn-off'} mt-2 text-center px-4 ml-2 rounded-full`}
                                                                onClick={() => toggleSeleccionado(sub.nombre_subcategoria)}
                                                            >
                                                                {sub.nombre_subcategoria}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}


                                        </div>

                                    </Grid>


                                    <Button
                                        className={buttonStyle}
                                        onClick={guardarPreferencias}
                                        type="button"
                                        fullWidth variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Guardar
                                    </Button>

                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </div>
            </div>

        </div>

    );
};

export default EventosPreferencias;
