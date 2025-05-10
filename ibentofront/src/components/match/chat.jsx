import React, { use, useState,useEffect } from 'react';
import "../../assets/css/botones.css";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { sender: 'Harry Styles', text: ['Hola, ¿cómo estás?'] ,image: "/minovio.jpeg"},
        { sender: 'Tú', text: '¡Hola! Estoy bien, ¿y tú?' ,image: "/jin3.jpeg"},
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [showDialogBlock, setShowDialogBlock] = useState(false);
   
   
    const query = new URLSearchParams(window.location.search);
    const roomName = query.get('room');
   
   
  
    const handdleInfo = () => {
        navigate("../verPerfil");
    };

    const handleBack = () => {
        navigate("../match");
    }


    // Creamos un socket para el chat en tiempo real
    // const socketURL = 'ws://localhost:8080/ws/chat/room_name/';
    // if (socketURL) {
    //     console.log('Conexión WebSocket establecida en:', socketURL);
    // } else {
    //     console.error('WebSocket URL no existe');}
    //const Socket = new WebSocket(socketURL);
    
    const [mensajes, setMensaje] = useState([]);
    const [receptor, setReceptor] = useState('');
    useEffect(() => async () => {
        const token = localStorage.getItem('access');
      
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/mensajes/${roomName}/`, {
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
    },[]);
    
    
const idCarolina ="681e5ce72d5dcb8f92ac6f19"
    const handleSendMessage = async() => {
        if (newMessage.trim() !== '') {
        //     setMessages([...messages, { sender: 'Tú', text: newMessage, image: "/isaac.jpeg" }]);
        //     setNewMessage('');
        console.log(roomName,idCarolina, newMessage);
        const token = localStorage.getItem('access');
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/mensajes/enviar/"    , {
                conversacion: roomName,
                receptor: idCarolina,
                mensaje: newMessage,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            if (response.status === 201) {
                console.log("Mensaje enviado:", response.data);
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
        <div className="text-black flex flex-col  items-center min-h-screen">
            <div className="relative flex flex-col shadow-lg justify-between w-full max-w-lg flex-grow">
                <div className="flex-grow overflow-y-auto shadow-t">
                    <div className="w-full">

                        <div className='bg-gray-200 '>
                        <div className="mb-2 flex justify-between font-bold text-2xl w-full">
                            <div className=" flex justify-between p-2 w-full">
                            <button onClick={handleBack}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>

                            </button>
                            <button onClick={handdleInfo} className="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            </div>
                        </div>


                        <div className="">
                            <div className="flex">
                                <img src="/harry.jpeg" className="w-10 h-10 object-cover rounded-full mr-2" />
                                <h1 className="text-xl font-semibold">{messages[0].sender}</h1>
                            </div>
                        </div>
                </div>

          
                        <div className="h-150 overflow-y-auto bg-white mt-3 w-full">
                            <div className="mt-9 mb-8 flex  justify-center items-center">
                                <div className="relative">
                                    <img src={messages[0].image} className="sombraMatch1 w-20 h-20 object-cover rounded-full" alt={messages[0].sender} />
                                    <div className="absolute bottom-1 right-0 w-full flex justify-center items-center">
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
                                <div className="relative ">
                                    <img src={messages[1].image} className="sombraMatch2 w-20 h-20 object-cover rounded-full" alt={messages[1].sender} />
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
                            <div className='p-3'>
                                {mensajes.map((message, index) => (
                                    <div>
                                    <p className={`flex ${message.remitente_id === 'null' ? 'justify-end mr-3' : 'justify-start ml-3'}`}>{message.remitente_id}</p>
                                    <div key={index} className={`flex mb-2 ${message.remitente_id === 'null' ? 'justify-end' : 'justify-start'}`}>
                                       
                                        {message.remitente_id !== 'null' && (
                                            
                                            <img src={message.image} className="w-8 h-8 object-cover rounded-full mr-2" />
                                        )}
                                       <span
                                       
                                            className={`p-2 rounded ${
                                                message.remitente_id =='null' ? 'bg-blue-400 text-white text-right' : 'bg-gray-200'
                                            }`}
                                            
                                            >  {message.text}
                                            </span>
                                            
                                        {message.remitente_id === 'null' && (
                                            <img src={message.image} className=" w-8 h-8 object-cover rounded-full ml-2" />
                                        )}
                                        <p>{message.mensaje}</p>
                                    </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="w-full flex items-center p-3 border-t">
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
