import React, { useState, useEffect, useRef } from 'react';
import "../../assets/css/botones.css";
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useIsWebVersion from '../../hooks/useIsWebVersion';

const Chat = () => {
    const navigate = useNavigate();
    const isWebVersion = useIsWebVersion();
    const [messages, setMessages] = useState([
        { sender: 'Harry Styles', text: ['Hola, ¿cómo estás?'] ,image: "/minovio.jpeg"},
        { sender: 'Tú', text: '¡Hola! Estoy bien, ¿y tú?' ,image: "/jin3.jpeg"},
    ]);
    const [newMessage, setNewMessage] = useState('');
   
    
    const myId = JSON.parse(localStorage.getItem('user'))?.id;

    const query = new URLSearchParams(window.location.search);
    const roomName = query.get('room');
   
    
   
  
    const handdleInfo = () => {
        navigate("../verPerfil?id=" + receptor._id+"&match="+roomName);
    };

    const handleBack = () => {
        navigate("../match");
    }

  
    

    const [mensajes, setMensaje] = useState([]);
    const [receptor, setReceptor] = useState([]);
    const [Me, setMe] = useState([]);


    useEffect(() => {
        const token = localStorage.getItem('access');
        const fetchUsersChat = async () => {
            try {
                const response = await api.get(`usuarios/${roomName}/conversacion/`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    console.log("Usuarios",response.data);
                    //El usuario 2 será el usuario que no es el mío
                    if(response.data[0]._id != myId){
                        setReceptor(response.data[0]);
                        setMe(response.data[1]);
                    }
                    else{
                        setReceptor(response.data[1]);
                        setMe(response.data[0]);
                    }
                 
                } else {
                    console.error("No hay conversación iniciada", response.statusText);
                }
            } catch (error) {
                console.error("Error al obtener los mensajes:", error);
            }
        };
        fetchUsersChat();
    }, [roomName]);

    useEffect(() => {
        const token = localStorage.getItem('access');
      
        const fetchMessages = async () => {

        try {
            const response = await api.get(`mensajes/${roomName}/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200) {
                console.log(response.data);
                setMensaje(response.data);
             
                
                    
            }else{
                console.error("No hay conversación iniciada", response.statusText);
            }
        }catch (error) {
            console.error("Error al obtener los mensajes:", error);
        }
        };
        fetchMessages();
    },[]);
    
    const messagesEndRef = useRef(null);
 const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

  useEffect(() => {
    if (!isWebVersion) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isWebVersion]);

  
useEffect(() => {
    scrollToBottom();
}, [mensajes]);

const idCarolina ="681e5ce72d5dcb8f92ac6f19"

const socketRef = useRef(null);

useEffect(() => {
    const socket = new WebSocket(`wss://ibento.onrender.com/ws/mensajes/${roomName}/`);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        console.log("Mensaje:", data.message.mensaje);
        console.log("Receptor:", data.message.remitente);
        console.log("Remitente:", data.message.destinatario);
        console.log("Conversacion:", data.message.conversacion_id);
        
        
        setMensaje((prevMessages) => [
            ...prevMessages,
            {   conversacion: roomName,
                fecha_envio: "hoy",
                mensaje:data.message.mensaje,
                receptor:  data.message.destinatario,
                remitente: data.message.remitente
                
            },
            
        ]);
       
    }
    socket.onopen = () => {
        console.log('✅ WebSocket conectado');
    };

    socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('🔌 WebSocket cerrado');
    };

    socketRef.current = socket;

    return () => {
        socket.close();
    };
}, [roomName]);


    const handleSendMessage = async() => {
        if (newMessage.trim() !== '') {
        const token = localStorage.getItem('access');
        
        try {
            const response = await api.post("mensajes/enviar/"    , {
                conversacion: roomName,
                receptor: receptor._id,
                mensaje: newMessage,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
           
            if (response.status === 201) {
               
                 const socket = socketRef.current;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        mensaje: newMessage,
                        receptor_id: response.data.receptor,
                        remitente_id: response.data.remitente,
                        conversacion: roomName,
                    }));
                  
                } else {
                    console.warn("⚠️ WebSocket aún no está abierto");
                }
                setNewMessage('');
            } else {
                console.error("Error al enviar el JE:", response);
            }
        }
        catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    }
    };    return (
        <div className={`relative w-full flex items-center justify-center bg-white ${isWebVersion ? 'min-h-screen pt-6 pb-6' : 'min-h-screen'}`}>
            {/* Contenedor principal glass */}
            <div className={`relative z-10 w-full flex flex-col rounded-3xl bg-white border border-blue-100 shadow-xl overflow-hidden ${isWebVersion ? 'max-w-2xl h-[calc(100vh-8rem)] mt-4 mx-4' : 'max-w-md mx-auto min-h-screen'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-blue-100">
                    <button className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition" onClick={handleBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-purple-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <img src={receptor.profile_pic} className="w-10 h-10 object-cover rounded-full border-2 border-blue-200 shadow" alt={receptor.nombre} />
                        <div className="text-left">
                            <h1 className="text-lg font-semibold text-purple-700">{receptor.nombre} {receptor.apellido}</h1>
                        </div>
                    </div>
                    <button className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition" onClick={handdleInfo}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-purple-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>                {/* Mensajes */}
                <div className={`flex-1 px-4 py-6 overflow-y-auto custom-scrollbar bg-white ${isWebVersion ? 'max-h-[calc(100vh-22rem)]' : 'max-h-[calc(100vh-17rem)] h-screen'}`}>
                    <div className="flex flex-col gap-4">
                        {mensajes.map((message, index) => (
                            <div key={index} className={`flex ${message.receptor != myId ? 'justify-end' : 'justify-start'}`}>
                                {message.receptor == myId && (
                                    <img src={receptor.profile_pic} className="w-8 h-8 object-cover rounded-full mr-2 shadow" />
                                )}
                                <span
                                    className={`px-4 py-2 rounded-2xl max-w-xs break-words text-base shadow border ${
                                        message.receptor == myId
                                            ? 'bg-blue-50 text-purple-700 border-blue-100'
                                            : 'bg-gradient-to-br from-purple-100 via-blue-100 to-white text-blue-900 border-blue-100'
                                    }`}
                                >
                                    {message.mensaje}
                                </span>
                                {message.receptor != myId && (
                                    <img src={Me.profile_pic} className="w-8 h-8 object-cover rounded-full ml-2 shadow" />
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Barra de emojis */}
                <div className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 border-t border-b border-blue-100 z-20" style={{minHeight:'48px'}}>
                    {['😀','😍','😂','🥰','😎','😭','🔥','👍','🎉','💜','💙','✨'].map((emoji) => (
                        <button
                            key={emoji}
                            className="text-2xl hover:scale-110 transition transform focus:outline-none text-purple-500"
                            style={{filter:'drop-shadow(0 1px 4px #a5b4fc33)'}}
                            onClick={() => setNewMessage(newMessage + emoji)}
                            type="button"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                {/* Input de mensaje */}
                <div className="w-full flex items-center gap-2 px-4 py-4 bg-white border-t border-blue-100 sticky bottom-0 z-30">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                        className="flex-grow px-4 py-2 rounded-full border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-purple-700 placeholder-blue-400 shadow-sm"
                        placeholder="Escribe un mensaje..."
                    />
                    <button onClick={handleSendMessage} className="p-2 bg-gradient-to-br from-purple-400 via-blue-400 to-blue-300 text-white rounded-full shadow-lg hover:scale-105 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}    

export default Chat;
