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
            setMessages([...messages, { sender: 'Tú', text: newMessage, image: "/isaac.jpeg" }]);
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
    };

    return (
        <div className="text-black flex flex-col  items-center min-h-screen">
            <div className="relative flex flex-col shadow-lg justify-between w-full max-w-lg flex-grow">
                <div className="flex-grow overflow-y-auto shadow-t">
                    <div className="w-full">

                        <div className='bg-gray-200'>
                        <div className="mb-2 flex justify-end items-end font-bold text-2xl w-full">
                            <button onClick={handdleInfo} className="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
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
                            <div className='p-3'>
                                {messages.map((message, index) => (
                                    <div key={index} className={`flex mb-2 ${message.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                                        {message.sender !== 'Tú' && (
                                            
                                            <img src={message.image} className="w-8 h-8 object-cover rounded-full mr-2" />
                                        )}
                                       <span
                                            className={`p-2 rounded ${
                                                message.sender =='Tú' ? 'bg-blue-400 text-white text-right' : 'bg-gray-200'
                                            }`}
                                            
                                            >  {message.text}
                                            </span>
                                        {message.sender === 'Tú' && (
                                            <img src={message.image} className=" w-8 h-8 object-cover rounded-full ml-2" />
                                        )}
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
                    <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded-full ml-2">
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
