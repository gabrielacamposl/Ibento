import { useEffect, useState } from 'react';
import axios from 'axios';

interface Event {
    _id: string;
    title: string;
    place: string;
    prices: [];
    location: string;
    coordenates: [];
    description: string;
    dates: [];
    imgs: [];
    url: string;
    numLike: number;
    numSaves : number;
    distance : number;
}

const useFetchEvents = (url: string) => {
    const [data, setData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<Event[]>(url);
                setData(response.data);
            } catch (err) {
                setError('Error al cargar los datos.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};

const useFetchNearestEvents = (url: string) => {

    const [data, setData] = useState<Event[]>([]);;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (url === 'http://127.0.0.1:8000/eventos/nearest/?lat=undefined&lon=undefined') {
            setData([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try{
                const response = await axios.get(url);
                if(response.status != 200){
                    throw new Error(`HTTP error. Status: ${response.status}`)
                }
                setData(response.data)
            } catch(e){
                setError(e);
                console.error('Error obteniendo eventos cercanos: ', e);
            }finally{
                setLoading(false);
            }
        }

        fetchData();
    }, [url]);

    return {data, loading, error};

}


export { useFetchEvents, useFetchNearestEvents};
