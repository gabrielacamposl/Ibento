import React, { use, useState,useEffect,useRef } from 'react';
import "../../assets/css/botones.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';
const Chat = () => {
    const navigate = useNavigate();
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
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  
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
    };

    return (
        <div className="text-black   w-full ">
            <div className="   justify-between w-full h-screen">
                <div className="flex-grow  shadow-t">
                    <div className="w-full">

                        <div className='shadow p-3 '>
                        <div className="  justify-between font-bold text-2xl w-full">
                            <div className=" flex justify-between m-2 w-full">
                            <button className="cursor-pointer" onClick={handleBack}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>

                            </button>
                            <button  className="cursor-pointer" onClick={handdleInfo} >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            </div>
                        </div>


                        <div className="mt-5 flex justify-between">
                            <div className="flex">
                                <img src={receptor.profile_pic} className="w-10 h-10 object-cover rounded-full mr-2" />
                                <h1 className="text-xl font-semibold">{receptor.nombre} {receptor.apellido}</h1>
                            </div>
                           
                        </div>
                </div>

          
                        <div className="max-h-[calc(100vh-15rem)]  h-screen overflow-y-auto  bg-white mt-3 w-full">
                            <div className="mt-10 mb-8 flex justify-center ">
                                <div className="relative ">
                                    <img src={receptor.profile_pic} className="sombraMatch1 w-20 h-20 object-cover rounded-full" alt={receptor.nombre} />
                                    <div className="absolute bottom-1 right-0 w-full flex justify-center ">
                                        <svg width="100" height="100">
                                            <defs>
                                                <path id="curve1" d="M 10,25 Q 50,-10 100,20" />
                                            </defs>
                                            <text fontSize="10" fontWeight="bold" fill="black">
                                                <textPath href="#curve1" startOffset="30%" textAnchor="middle">
                                                    ¡NUEVO
                                                </textPath>
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                                <div className="relative min-w-[100px] ml-2">
                                    <img src={Me.profile_pic} className="sombraMatch2 w-20 h-20 object-cover rounded-full" alt={messages[1].sender} />
                                    <div className="absolute top-9 right-2 w-full flex justify-center items-center">
                                        <svg width="100" height="100">
                                            <defs>
                                                <path id="curve2" d="M -10,20 Q 10,100 100,40" fill="transparent" />
                                            </defs>
                                            <text fontSize="10" fontWeight="bold" fill="black">
                                                <textPath href="#curve2" startOffset="50%" textAnchor="middle">
                                                    ACOMPAÑANTE!
                                                </textPath>
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                            </div>


                             {/*AQUÍ COMIENZA EL CHAT */}
                            <div className=" flex-grow m-3 max-h-[calc(100vh-4rem)]"> 
                                {mensajes.map((message, index) => (
                                    <div key={index}>
                                  
                                    <div  className={`flex mb-4 ${message.receptor != myId ? 'justify-end' : 'justify-start'}`}>
                                       {/*IMAGEN */}
                                        {message.receptor == myId && (
                                            
                                            <img src={receptor.profile_pic} className="w-8 h-8 object-cover rounded-full mr-2" />
                                        )}

                                      
                                        {/*MENSAJE */}
                                        <span
                                            className={`p- rounded  p-2 rounded max-w-xs break-words ${
                                                message.receptor == myId ?  'bg-gray-200' : 'bg-blue-400 text-white text-justify'
                                            }`}
                                        >
                                            {message.mensaje}
                                        </span>
                                        {/*IMAGEN */}
                                        {message.receptor != myId && (
                                            <img src={Me.profile_pic} className=" w-8 h-8 object-cover rounded-full ml-2" />
                                        )}
                                      
                                    </div>
                                    
                                    </div>
                                ))}
                                  <div ref={messagesEndRef} /> {/* <- esto es lo importante */}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="w-full flex items-center ">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                        className="flex-grow p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Escribe un mensaje..."
                    />
                    <button onClick={ handleSendMessage} className="p-2 bg-blue-500 text-white rounded-full ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}    

export default Chat;
