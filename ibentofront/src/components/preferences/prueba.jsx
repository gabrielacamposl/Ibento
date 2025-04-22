import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Toast } from 'primereact/toast';

const Preferencias = () => {
    const [categorias, setCategorias] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const toast = useRef(null);
    const usuarioId = localStorage.getItem("usuario_id");
    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get('http://localhost:8000/api/categorias/')
            .then(response => {
                setCategorias(response.data);
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

    const guardarPreferencias = () => {
        const subcategoriasSeleccionadas = categorias.flatMap((categoria) =>
            categoria.subcategorias
                .filter((sub) => seleccionados.includes(sub.nombre_subcategoria))
                .map((sub) => sub._id)
        );

        if (subcategoriasSeleccionadas.length === 0) {
            toast.current.show({
                severity: 'error',
                summary: 'No se seleccionaron preferencias',
                detail: 'Por favor selecciona al menos una preferencia de evento.',
                life: 3000,
            });
            return;
        }

        // Actualizar preferencias y marcar como completadas
        axios.put(
            `http://localhost:8000/usuarios/${usuarioId}/preferencias/`, 
            { preferencias_evento: subcategoriasSeleccionadas, preferencias_completadas: true },
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        .then(response => {
            toast.current.show({
                severity: 'success',
                summary: 'Preferencias guardadas',
                detail: 'Tus preferencias de eventos se han actualizado con éxito.',
                life: 3000,
            });
            // Redirigir al dashboard o a donde se deba ir después de completar las preferencias
            navigate('/dashboard');
        })
        .catch(err => {
            console.error('Error al guardar preferencias:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Error al guardar preferencias',
                detail: 'Ocurrió un error al guardar tus preferencias. Intenta nuevamente.',
                life: 3000,
            });
        });
    };

    return (
        <div>
            <h3>Selecciona tus preferencias</h3>
            {categorias.map((categoria) => (
                <div key={categoria.id}>
                    <h4>{categoria.nombre}</h4>
                    <ul>
                        {categoria.subcategorias.map((sub) => (
                            <li key={sub._id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={sub.nombre_subcategoria}
                                        onChange={() => toggleSeleccionado(sub.nombre_subcategoria)}
                                    />
                                    {sub.nombre_subcategoria}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <button onClick={guardarPreferencias}>Guardar Preferencias</button>
            <Toast ref={toast} />
        </div>
    );
};

export default Preferencias;
