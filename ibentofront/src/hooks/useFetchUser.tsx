import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api';

interface Event {
    save_event: [];
    favourite_event: [];
}


const useFetchUserEvents = (token:string) => {
    const [data, setData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const url = 'usuarios/events/'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<any[]>
                (url,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                )
                setData(response.data);
                console.log('Data fetched:', response.data);
            } catch(err){
                setError('Error al cargar los datos.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [url, token]);
    return { data, loading, error };
};

export {useFetchUserEvents};