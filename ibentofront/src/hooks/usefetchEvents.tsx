import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api'

interface Event {
    _id: string;
    title: string;
    place: string;
    price: [];
    location: string;
    coordenates: [];
    description: string;
    classifications: string[];
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
                const response = await api.get<Event[]>(url);
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

const useFetchEvent = (url: string) => {
    const [data, setData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<Event[]>(url);
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

    url = 'eventos/nearest  /?lat=undefined&lon=undefined'

    const [data, setData] = useState<Event[]>([]);;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (url === url || url == '') {
            setData([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try{
                const response = await api.get(url);
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

const useFetchRecommendedEvents = (url: string, token:string) => {
    const [data, setData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<Event[]>(url, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
            );
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

const saveEvent = (eventId: string) => {

    const fetchData = async () => {
        try{
            const response = await api.get("");
            if(response.status != 200){
                throw new Error(`HTTP error. Status: ${response.status}`)
            }
        } catch(e){
            console.error('Error obteniendo eventos cercanos: ', e);
        }finally{
        }
    }
}

export { useFetchEvents, useFetchNearestEvents, useFetchEvent, useFetchRecommendedEvents};
