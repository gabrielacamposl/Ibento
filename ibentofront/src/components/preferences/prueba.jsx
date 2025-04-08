import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Intereses = () => {
    const [categorias, setCategorias] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);

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
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="degradadoPerfil relative flex flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="miPerfil flex font-bold text-2xl w-full">
                    <h1 className='miPerfil'>Editar Intereses</h1>
                </div>

                <div className="flex justify-center items-center mb-5 space-x-4">

                </div>

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

                <Link to="/perfil" className="text-white flex items-center justify-center p-2 mt-4">
                    <button className='rounded-full btn-custom text-2xl flex wrap font-semibold items-center justify-center px-10'>Guardar</button>
                </Link>
            </div>
        </div>
    );
};

export default Intereses;
