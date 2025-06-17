import React, { useState } from 'react';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const Page = () => {
    const [activeTab, setActiveTab] = useState("terminos");
    const [activeSection, setActiveSection] = useState("0");

    // Definimos las secciones con su contenido
    const sections = {
    "0":{
        title: "Términos y Condiciones de Uso de Ibento",
        content: (
            <>
            <div className="glass-premium rounded-3xl p-8 mb-8 border border-white/30 shadow-xl">
                <p className="text-gray-700 leading-relaxed text-lg">
                Estos Términos y Condiciones regulan el uso de nuestra aplicación 
                web progresiva, diseñada como plataforma social para encontrar 
                eventos en la Ciudad de México y posibles acompañantes para estos. 
                Ibento está pensada para brindar una experiencia única, amigable y 
                divertida, asimismo, para nosotros es importante mantener un entorno 
                seguro. Por lo que, al utilizar nuestra aplicación, aceptas cumplir 
                con estos Términos y con nuestras Normas de la Comunidad y Consejos 
                de Seguridad.
                </p>
            </div>
            </>
        )
    },
    "1": {
      title: "Introducción",
      content: (
        <>
          <div className="glass-premium rounded-2xl p-6 mb-4 border border-white/30">
            <p className="text-gray-700 leading-relaxed">
              Bienvenido a Ibento, la aplicación tanto móvil como página web. Estos 
              Términos y Condiciones regulan el uso de la Aplicación, un servicio 
              que ayuda a los usuarios a encontrar varios eventos de distintas en 
              la Ciudad de México y facilita encontrar acompañantes para dichos 
              eventos mediante un sistema de "match". Al utilizar la Aplicación, 
              aceptas cumplir estos Términos y Condiciones, así como nuestra 
              Política de Privacidad.
            </p>
          </div>
        </>
      ),
    },
    "2": {
      title: "Descripción del Servicio",
      content: (
        <div className="glass-premium rounded-2xl p-6 border border-white/30">
          <p className="text-gray-700 leading-relaxed">
            La aplicación proporciona recomendaciones de eventos basados en preferencias
             y proximidad, permitiendo a los usuarios crear eventos y conectar con 
             personas con intereses en común para asistir juntos. La Aplicación 
             también implementa medidas de seguridad y verificación de identidad 
             para fomentar un ambiente seguro para los usuarios.
          </p>
        </div>
      ),
    },
    "3": {
      title: "Uso de la aplicación y reglas relacionadas con el contenido",
      content: (
        <>
          <div className="glass-premium rounded-2xl p-6 mb-6 border border-white/30">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">¿Quién puede usar Ibento?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ibento es un espacio para todos los adolescentes y adultos que deseen 
              recomendaciones de eventos según sus preferencias y su cercanía. Puede 
              usar Ibento y sus características registrándose como miembro en la aplicación. 
              Sin embargo, el espacio para encontrar acompañantes mediante la aplicación tener 
              18 años en adelante, ya que para validar la identidad del usuario es necesario 
              que este cuente con una identificación oficial emitida por la Institución 
              Nacional Electoral (INE) (i), y tendrá permisos legales para usar Ibento 
              según las leyes mexicanas.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Asimismo, garantiza que (ii) tiene el derecho, la autoridad y la capacidad para aceptar y cumplir con estos Términos, (iii) toda la información de registro que proporcione es precisa y completa, y (iv) al usar Ibento, no está violando ninguna ley o regulación del país. Usted el único responsable del cumplimiento de todas las leyes y regulaciones locales aplicables.
              Además, garantiza que no ha sido condenado, ni está sujeto a ninguna orden judicial relacionada con agresión, violencia, conducta sexual inapropiada o acoso.
            </p>
          </div>

          <div className="glass-premium rounded-2xl p-6 border border-white/30">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">¿Qué tipo de contenido se puede publicar o cargar en Ibento?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puedes publicar o cargar todo tipo de contenido en Ibento, incluidos fotografías, correos electrónicos, ubicación, mensajes y otros tipos de contenido ("Contenido").
              Sin embargo, existen reglas sobre lo que se considera aceptable. Por lo tanto, al usar Ibento, no puede publicar, enviar ni cargar ningún contenido que:
            </p>
            <ul className="text-gray-700 space-y-2 ml-6 mb-4">
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Contenga un lenguaje que pueda considerarse ofensivo o que probablemente cause molestias, alarma o incomodidad a otras personas.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Sea obsceno, pornográfico o que de alguna manera pueda ofender la dignidad humana.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Sea abusivo, insultante o amenazante, o que promueva, retrate o fomente la violencia, autolesiones, suicidio, racismo, sexismo, odio o intolerancia.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Fomente actividades ilegales, incluyendo, sin limitación, terrorismo, incitación al odio racial o cuya transmisión implique la comisión de un delito.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Sea difamatorio.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Impulse el envío de "spam".</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Supla la identidad de una persona, empresa o marca con la intención de engañar o confundir a otros.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Infrinja los derechos de terceros, incluidos los derechos de propiedad intelectual y privacidad.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Muestra a otra persona sin su conocimiento, y sin que esa persona haya tenido la oportunidad de rechazar tal creación o distribución.</li>
                <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>Contenga imágenes de menores, incluso si tú también estás en la foto, o ponga en peligro a menores.</li>
            </ul>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
              <p className="text-gray-700 leading-relaxed">
                Por favor, use el sentido común al elegir el contenido que publique, suba o envíe a través de Ibento, ya que es el único responsable de dicho contenido y asume toda la responsabilidad legal relacionada con él.
                Contamos con una combinación de tecnologías y moderadores para garantizar que el contenido que se publique cumpla con nuestras normas. Sin embargo, la responsabilidad última recae en el usuario.
              </p>
            </div>
          </div>
        </>
      ),
    },
    "4": {
      title: "Restricciones de la Aplicación",
      content: (
        <div className="glass-premium rounded-2xl p-6 border border-white/30">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-700">Aceptas:</h4>
              <ul className="space-y-2">
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Cumplir con todas las leyes aplicables</span></li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Utilizar tu nombre y edad reales</span></li>
                <li className="flex items-start"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Usar los servicios de manera segura y respetuosa</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-red-700">No debes:</h4>
              <ul className="space-y-2">
                <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Actuar de manera irrespetuosa o discriminatoria</span></li>
                <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Falsificar tu identidad o información</span></li>
                <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Acosar o perseguir a otros usuarios</span></li>
                <li className="flex items-start"><span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Usar la aplicación de manera manipulativa</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-l-4 border-orange-500">
            <p className="text-gray-700 leading-relaxed text-sm">
              Nos reservamos el derecho de investigar cualquier posible violación de estos Términos y terminar inmediatamente el derecho de cualquier usuario a usar la aplicación sin previo aviso.
            </p>
          </div>
        </div>
      ),
    },
    "5": {
      title: "Registro y Verificación de Identidad",
      content: (
        <div className="space-y-6">
          <div className="glass-premium rounded-2xl p-6 border border-white/30">
            <h4 className="text-lg font-semibold mb-3 text-purple-700">Registro General</h4>
            <ul className="space-y-2">
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Proveer una dirección de correo electrónico válida</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Crear una contraseña segura (mínimo 8 caracteres)</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Seleccionar categorías de eventos de interés</span></li>
            </ul>
          </div>
          <div className="glass-premium rounded-2xl p-6 border border-white/30">
            <h4 className="text-lg font-semibold mb-3 text-blue-700">Verificación para Match</h4>
            <ul className="space-y-2">
              <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Subir imagen de INE (ambos lados)</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Fotografía en tiempo real para verificación</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Seleccionar preferencias personales</span></li>
            </ul>
          </div>
        </div>
      ),
    },
    "6": {
      title: "Funcionalidades de la Aplicación",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-premium rounded-2xl p-6 border border-white/30">
            <h4 className="text-lg font-semibold mb-3 text-purple-700">Funciones Principales</h4>
            <ul className="space-y-3">
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700"><strong>Recomendación de Eventos:</strong> Sugerencias basadas en preferencias y ubicación</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700"><strong>Sistema de Match:</strong> Encuentra acompañantes compatibles</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700"><strong>Sistema de Mensajería:</strong> Chat encriptado seguro</span></li>
            </ul>
          </div>
          <div className="glass-premium rounded-2xl p-6 border border-white/30">
            <h4 className="text-lg font-semibold mb-3 text-blue-700">Funciones Adicionales</h4>
            <ul className="space-y-3">
              <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700"><strong>Notificaciones:</strong> Alertas personalizadas de eventos</span></li>
              <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700"><strong>Gestión de Eventos:</strong> Crear y administrar eventos</span></li>
            </ul>
          </div>
        </div>
      ),
    },
    "7": {
      title: "Obligación del Usuario",
      content: (
        <div className="glass-premium rounded-2xl p-6 border border-white/30">
          <h4 className="text-lg font-semibold mb-4 text-purple-700">El Usuario se compromete a:</h4>
          <ul className="space-y-3">
            <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Usar la aplicación únicamente para los fines previstos</span></li>
            <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Proporcionar información veraz y actualizada</span></li>
            <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">Mantener la confidencialidad de sus credenciales</span></li>
            <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">No utilizar la aplicación para fines ilegales</span></li>
            <li className="flex items-start"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="text-gray-700">No compartir información personal de otros usuarios sin consentimiento</span></li>
          </ul>
        </div>
      ),
    },
    };

    const privacidadSections = {
  "0": {
    title: "¿Quiénes somos?",
    content: (
      <div className="glass-premium rounded-2xl p-6 border border-white/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">I</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed text-center">
          Si vives en la Ciudad de México, México, la compañía responsable para el control de tu información es:
        </p>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mt-4 text-center">
          <p className="text-gray-800 font-semibold">Ibento, Inc</p>
          <p className="text-gray-700">ESCOM IPN</p>
          <p className="text-gray-700">Av. Juan de Dios Bátiz</p>
          <p className="text-gray-700">Unidad Profesional Adolfo López Mateos</p>
          <p className="text-gray-700">Gustavo A. Madero, Ciudad de México, México</p>
        </div>
        <p className="text-gray-600 text-sm mt-4 text-center italic">
          Ibento actúa como controlador de tus datos de información personal que es recopilada y procesada a través de la App.
        </p>
      </div>
    ),
  },
  "1": {
    title: "¿Dónde aplica el aviso de privacidad?",
    content: (
        <>
            <div className="glass-premium rounded-2xl p-6 mb-6 border border-white/30">
              <p className="text-gray-700 leading-relaxed">
                  Este aviso de privacidad aplica para la aplicación web progresiva y todos los futuros servicios que actúen bajo la marca de Ibento. A su vez, aplica para todos aquellos que hayan hecho uso de la aplicación, sea para obtener sugerencias de eventos o para buscar un acompañante.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-purple-700">Datos recopilados</h3>
            
            <h4 className="text-lg font-medium mb-3 text-gray-800">Datos que solicitamos</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                    <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                    <th className="px-6 py-4 text-left font-semibold">Datos recolectados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Datos de la cuenta</td>
                    <td className="px-6 py-4 align-top text-gray-700">Información básica necesaria para configurar su cuenta.</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Dirección de correo electrónico</li>
                        <li>Fecha de nacimiento</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Datos del perfil</td>
                    <td className="px-6 py-4 align-top text-gray-700">Detalles adicionales que nos permiten recomendar eventos y personas con mayor exactitud.</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Nombre y apellidos</li>
                        <li>Identidad de género</li>
                        <li>Orientación sexual</li>
                        <li>Intereses y preferencias</li>
                        <li>Ubicación aproximada</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Contenido</td>
                    <td className="px-6 py-4 align-top text-gray-700">Multimedia compartido en la plataforma</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Fotos de perfil</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h4 className="text-lg font-medium mb-3 text-gray-800">Datos generados</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                    <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                    <th className="px-6 py-4 text-left font-semibold">Datos recolectados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Datos de uso</td>
                    <td className="px-6 py-4 align-top text-gray-700">Información generada sobre su actividad en el servicio.</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Inicios de sesión</li>
                        <li>Eventos vistos</li>
                        <li>Emparejamientos aceptados</li>
                        <li>Emparejamientos negados</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h4 className="text-lg font-medium mb-3 text-gray-800">Datos recopilados con su permiso</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                    <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                    <th className="px-6 py-4 text-left font-semibold">Datos recolectados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Datos de geolocalización</td>
                    <td className="px-6 py-4 align-top text-gray-700">Ubicación geográfica (con su permiso explícito).</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Latitud y longitud</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Datos biométricos</td>
                    <td className="px-6 py-4 align-top text-gray-700">Para verificación de cuenta y prevención de fraude.</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Geometría facial</li>
                      </ul>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/60 transition-colors duration-200">
                    <td className="px-6 py-4 align-top font-medium text-gray-800">Identificación oficial</td>
                    <td className="px-6 py-4 align-top text-gray-700">Para verificar su identidad y edad.</td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>INE (frente y reverso)</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </>
    ),
  },
  "2": {
    title: "¿Por qué y cómo usamos sus datos?",
    content: (
        <>
      <p className="text-gray-700 text-sm">
       Nuestro objetivo principal es poder ofrecerle la mejor experiencia al hacer uso de nuestros servicios y poder mejorarlos con el tiempo. Es por esto que realizamos el procesamiento de sus datos. El propósito del procesamiento de los datos, los fundamentos con los cuales hacemos uso de estos y sus categorías son las siguientes:
      </p>      <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <th className="px-6 py-4 text-left font-semibold">
              Propósitos del procesamiento de sus datos
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              Fundamentos para procesar sus datos
            </th>
            <th className="px-6 py-4 text-left font-semibold">
              Categorías de datos procesados
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20">
          {/* Primer grupo de propósitos */}
          <tr className="hover:bg-white/60 transition-colors duration-200">
            <td className="px-6 py-4 align-top text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Crear su cuenta y su perfil en nuestro servicio.</li>
                <li>
                  Recomendarle eventos en los que puede estar interesado.
                </li>
                <li>
                  Recomendarle a usted diferentes acompañantes y recomendarlo a ellos.
                </li>
              </ul>
            </td>
            <td className="px-6 py-4 align-top text-gray-700">
              Poder ofrecerle nuestro servicio.
            </td>
            <td className="px-6 py-4 align-top text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos de la cuenta</li>
                <li>Datos del perfil</li>
                <li>Datos de geolocalización</li>
              </ul>
            </td>
          </tr>
          {/* Segundo grupo de propósitos */}
          <tr className="hover:bg-white/60 transition-colors duration-200">
            <td className="px-6 py-4 align-top text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Verificación de su cuenta, prevenir el fraude y garantizar la
                  seguridad de nuestros Usuarios.
                </li>
              </ul>
            </td>
            <td className="px-6 py-4 align-top text-gray-700">
              Obtener su consentimiento para hacer uso de datos confidenciales o
              datos de otro tipo.
            </td>
            <td className="px-6 py-4 align-top text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos de geometría facial</li>
                <li>Datos identificación</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
        </>
      
    ),
  },
  "3": {
    title: "¿Cómo compartimos sus datos?",
    content: (
        <>
      <p className="text-gray-700 text-sm">
        Haciendo uso del servicio, parte de su información es compartida con otros miembros del servicio. Esto únicamente si desea hacer uso del apartado de emparejamiento, si no es el caso, su información contenida en datos de la cuenta y datos del perfil se mantendrá oculta para los demás usuarios.
      </p>      <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <th className="px-6 py-4 text-left font-semibold">Destinatarios</th>
            <th className="px-6 py-4 text-left font-semibold">Razones para compartir</th>
            <th className="px-6 py-4 text-left font-semibold">Categorías</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20">
          {/* Otros miembros */}
          <tr className="hover:bg-white/60 transition-colors duration-200">
            <td className="px-6 py-4 align-top font-medium text-gray-800">Otros miembros</td>
            <td className="px-6 py-4 align-top text-gray-700">
              Compartimos datos suyos con otros miembros en el momento en que pone información suya en el servicio (perfil).
            </td>
            <td className="px-6 py-4 align-top text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos del perfil</li>
                <li>Contenido</li>
              </ul>
            </td>
          </tr>
          {/* Proveedores de servicios */}
          <tr className="hover:bg-white/60 transition-colors duration-200">
            <td className="px-6 py-4 align-top font-medium text-gray-800">Proveedores de servicios</td>
            <td className="px-6 py-4 align-top text-gray-700">
              Compartimos datos con aquellos socios que nos permiten operar el servicio. El gestor de información.
            </td>
            <td className="px-6 py-4 align-top text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos de la cuenta</li>
                <li>Datos de perfil</li>
                <li>Contenido</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
        </>
    ),
  },
  "4": {
    title: "Sus derechos",
    content: (
       <div className="glass-premium rounded-2xl p-6 border border-white/30">
        <p className="text-gray-700 leading-relaxed">
          Leyes de privacidad aplicables en tu país.
          Por el simple hecho de hacer uso de nuestra aplicación, usted se hace acreedor de los siguientes derechos, opciones y herramientas disponibles. Esto porque, nosotros como Ibento, busca que tenga el control de sus datos.
        </p>
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2 text-purple-700">El usuario tiene derecho a:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700">Ser informado sobre los datos personales que fueron procesados y en que son utilizados.</li>
            <li className="text-gray-700">Modificar o actualizar sus datos personales en caso de que estén inexactos o incorrectos.</li>
            <li className="text-gray-700">Solicitar una copia de sus datos.</li>
            <li className="text-gray-700">Que se eliminen sus datos personales cuando elimine su cuenta.</li>
            <li className="text-gray-700">Oponerse a que procesemos sus datos personales.</li>
            <li className="text-gray-700">Modificar los permisos y consentimientos previamente otorgados a la aplicación.</li>
          </ul>
        </div>
      </div>
    ),
  },
  "5": {
    title: "Ubicación de los datos y cuánto tiempo conservamos sus datos",
    content: (
      <div className="glass-premium rounded-2xl p-6 border border-white/30">
        <p className="text-gray-700 leading-relaxed">
          Toda la información recabada en la aplicación estará ubicada en servidores y centros de datos de terceros, específicamente servidores utilizados por la base de datos en la nube de MongoDB. 
          En caso de que decida dejar de usar nuestro servicio, su cuenta y perfil ya podrá ser accedida por otros usuarios en la aplicación. Una vez eliminada que decida eliminar su cuenta, la información será eliminada en el transcurso de lo que tarde en procesar la petición el servidor. 
        </p>
      </div>
    ),
  },
  "6": {
    title: "Nuestra política en materia de edad",
    content: (
      <div className="glass-premium rounded-2xl p-6 border border-white/30">
        <p className="text-gray-700 leading-relaxed">
          Para hacer uso de la aplicación, el usuario debe tener por lo menos 18 años. Y esto se verifica al acceder al apartado de emparejamiento, donde se solicitará una identificación oficial con la que se el usuario pueda comprobar esta información.
        </p>
      </div>
    ),
  },
  "7": {
    title: "Seguridad",
    content: (
        <div className="glass-premium rounded-2xl p-6 border border-white/30">
           <p className="text-gray-700 leading-relaxed">
           Nosotros como Ibento, queremos usar todos los medios disponibles para asegurar la protección de usted y de su información. Es por lo que, aparte de las medidas que usamos en el servicio, queremos que usted siga estas medidas para evitar cualquier tipo de perdida de datos, acceso desautorizado, etc.
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-4">
              <li className="text-gray-700">No compartir su contraseña.</li>
              <li className="text-gray-700">Cambia cada 6 meses su contraseña y siga las indicaciones para tener una contraseña fuerte.</li>
              <li className="text-gray-700">Cierra la sesión cada vez que use la aplicación en dispositivos ajenos.</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-4">
              Ante cualquier sospecha de que alguien ha tenido acceso a tu cuenta, favor de contactar al siguiente correo:
            </p>
            <p className="text-gray-800 font-semibold">
              <strong>heyibento@gmail.com</strong>
            </p>
          </div>
    )
  },
  "8": {
    title: "Cambios en la política",
    content: (
        <div className="glass-premium rounded-2xl p-6 border border-white/30">
          <p className="text-gray-700 leading-relaxed">
          La política implementada por Ibento puede cambiar a lo largo del tiempo. En base con cómo va cambiando el panorama y la tecnología, buscamos mantenernos actualizados con las practicas con las que se procesan los datos, teniendo siempre como objetivo mantener un alto estándar en la protección de datos del usuario. Siempre puede acceder a la última versión de la política de privacidad en la aplicación web progresiva.
          </p>
        </div>
    )
  }
    };    return (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
    {/* Efectos de fondo */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    {/* Contenedor principal con glassmorphism */}
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header con pestañas */}
      <div className="glass-premium border-b border-white/30 shadow-lg">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
              activeTab === "terminos"
                ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                : "text-gray-600 hover:text-purple-600 hover:bg-white/20"
            }`}
            onClick={() => {
              setActiveTab("terminos");
              setActiveSection("0");
            }}
          >
            Términos y Condiciones
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
              activeTab === "privacidad"
                ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                : "text-gray-600 hover:text-purple-600 hover:bg-white/20"
            }`}
            onClick={() => {
              setActiveTab("privacidad");
              setActiveSection("0");
            }}
          >
            Aviso de Privacidad
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1">
        {/* Sidebar de navegación */}
        <div className="w-20 glass-premium border-r border-white/30 p-4">
          <div className="flex flex-col space-y-3">
            {Object.keys(activeTab === "terminos" ? sections : privacidadSections).map((item) => (
              <button
                key={item}
                className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeSection === item
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/60 text-gray-600 hover:bg-white/80 hover:text-purple-600 shadow-md"
                }`}
                onClick={() => setActiveSection(item)}
                title={activeTab === "terminos" ? sections[item].title : privacidadSections[item].title}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        
        {/* Área de contenido */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header del contenido */}
            <div className="glass-premium rounded-3xl p-8 mb-8 border border-white/30 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {activeTab === "terminos" ? "Términos y Condiciones" : "Aviso de Privacidad"}
                  </h1>
                  <p className="text-gray-600 mt-2">Información legal importante para el uso de Ibento</p>
                </div>
              </div>
            </div>

            {/* Contenido de la sección */}
            <div className="glass-premium rounded-2xl p-8 border border-white/30 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
                {activeTab === "terminos" 
                  ? sections[activeSection].title 
                  : privacidadSections[activeSection].title}
              </h2>

              <div className="prose prose-lg max-w-none">
                {activeTab === "terminos" 
                  ? sections[activeSection].content 
                  : privacidadSections[activeSection].content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default Page;
