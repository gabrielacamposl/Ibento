import React, { useState } from 'react';
import "../../assets/css/botones.css";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { sender: 'Harry Styles', text: 'Hola, ¿cómo estás?' ,image: "/harry.jpeg"},
        { sender: 'Tú', text: '¡Hola! Estoy bien, ¿y tú?' ,image: "/isaac.jpeg"},
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [showDialogBlock, setShowDialogBlock] = useState(false);

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            setMessages([...messages, { sender: 'Tú', text: newMessage }]);
            setNewMessage('');
        }
    };

    const handleCancelBlock = () => {
        setShowDialogBlock(true);
    };

    const handleCloseBlock = () => {
        setShowDialogBlock(false);
    };




    const handdleInfo = () => {
        navigate("../verPerfil");
    }
    return (
        <div className="text-black flex flex-col justify-center items-center min-h-screen p-4">
            <div className="relative flex h-120 flex-col items-center mt-5 shadow-md p-5 shadow-t max-w-lg w-full">
                <div className="w-full  ">
                    <div className=''>
                    <div className="mb-2 flex justify-end items-end font-bold text-2xl w-full">
                                <button onClick={handdleInfo} className="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                        
                                </button>
                                     
                    </div>
                    <div className='flex '>
                        <img src="/minovio.jpeg" className="w-10 h-10 object-cover rounded-full mr-2" />
                        <h1 className="text-xl font-semibold">{messages[0].sender}</h1>
                    </div>
                    </div>
                    <div className="h-full bg-white mt-3 w-full h-48 overflow-y-auto">
                        <div className='mt-5 mb-5 flex justify-center items-center'>
                            <div className="relative">
                                <img src={messages[0].image} className="sombraMatch1 w-20 h-20 object-cover rounded-full" alt={messages[0].sender} />
                                <div className="absolute bottom-2 right-2 w-full flex justify-center items-center">
                                    <svg width="100" height="50">
                                        <defs>
                                            <path id="curve1" d="M 10,20 Q 50,-10 100,20" />
                                        </defs>
                                        <text fontSize="10" fontWeight="bold" fill="black">
                                            <textPath href="#curve1" startOffset="20%" textAnchor="middle">
                                                ¡NUEVO
                                            </textPath>
                                        </text>
                                    </svg>
                                </div>
                            </div>
                            <div className="relative">
                                <img src={messages[1].image} className="sombraMatch2 w-20 h-20 object-cover rounded-full" alt={messages[1].sender} />
                                <div className="absolute top-2 right-2 w-full flex justify-center items-center">
                                    <svg width="100" height="100">
                                        <defs>
                                            <path id="curve2" d="M -20,20 Q 10,100 100,40" fill="transparent" />
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
                        {messages.map((message, index) => (
                            <div key={index} className={`flex mb-2 ${message.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                                {message.sender !== 'Tú' && (
                                    <img src={message.image} className="w-8 h-8 object-cover rounded-full mr-2" />
                                )}
                                <span className="bg-gray-200 p-2 rounded">{message.text}</span>
                                {message.sender === 'Tú' && (
                                    <img src={message.image} className="w-8 h-8 object-cover rounded-full ml-2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow p-2 border rounded-l"
                        placeholder="Escribe un mensaje..."
                    />
                    <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded-r">Enviar</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
