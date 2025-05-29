import React, { useState } from "react";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const Page = () => {
    const [activeTab, setActiveTab] = useState("terminos");
    const [activeSection, setActiveSection] = useState("0");

    // Definimos las secciones con su contenido
    const sections = {
    "0":{
        title: "Terminos y Condiciones de Uso de Ibento",
        content: (
            <>
            <div className="mb-4">
                <p className="text-gray-700 text-sm">
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
          <div className="mb-4">
            <p className="text-gray-700 text-sm">
              Bienvenido a Ibento, la aplicación tanto móvil como página web. Estos 
              Términos y Condiciones regulan el uso de la Aplicación, un servicio 
              que ayuda a los usuarios a encontrar varios eventos de distintas en 
              la Ciudad de México y facilita encontrar acompañantes para dichos 
              eventos mediante un sistema de “match”. Al utilizar la Aplicación, 
              aceptas cumplir estos Términos y Condiciones, así como nuestra 
              Política de Privacidad.
            </p>
          </div>
        </>
      ),
    },
    "2": {
      title: "Descripción del Servicio ",
      content: (
        <p className="text-gray-700 text-sm">
          La aplicación proporciona recomendaciones de eventos basados en preferencias
           y proximidad, permitiendo a los usuarios crear eventos y conectar con 
           personas con intereses en común para asistir juntos. La Aplicación 
           también implementa medidas de seguridad y verificación de identidad 
           para fomentar un ambiente seguro para los usuarios.
        </p>
      ),
    },
    "3": {
      title: "Uso de la aplicación y reglas relacionadas con el contenido",
      content: (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">¿Quién puede usar Ibento?</h3>
            <p className="text-gray-700 text-sm">
              Ibento es un espacio para todos los adolescentes y adultos que deseen 
              recomendaciones de eventos según sus preferencias y su cercanía. Puede 
              usar Ibento y sus características registrándose como miembro en la aplicación. 
              Sin embargo, el espacio para encontrar acompañantes mediante la aplicación tener 
              18 años en adelante, ya que para validar la identidad del usuario es necesario 
              que este cuente con una identificación oficial emitida por la Institución 
              Nacional Electoral (INE) (i), y tendrá permisos legales para usar Ibento 
              según las leyes mexicanas.
              Asimismo, garantiza que (ii) tiene el derecho, la autoridad y la capacidad para aceptar y cumplir con estos Términos, (iii) toda la información de registro que proporcione es precisa y completa, y (iv) al usar Ibento, no está violando ninguna ley o regulación del país. Usted el único responsable del cumplimiento de todas las leyes y regulaciones locales aplicables.
              Además, garantiza que no ha sido condenado, ni está sujeto a ninguna orden judicial relacionada con agresión, violencia, conducta sexual inapropiada o acoso.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">¿Qué tipo de contenido se puede publicar o cargar en Ibento?</h3>
            <p className="text-gray-700 text-sm">
              Puedes publicar o cargar todo tipo de contenido en Ibento, incluidos fotografías, correos electrónicos, ubicación, mensajes y otros tipos de contenido (“Contenido”).
              Sin embargo, existen reglas sobre lo que se considera aceptable. Por lo tanto, al usar Ibento, no puede publicar, enviar ni cargar ningún contenido que:
            </p>
    <ul className="text-gray-700 text-sm">
        <li>Contenga un lenguaje que pueda considerarse ofensivo o que probablemente cause molestias, alarma o incomodidad a otras personas.</li>
        <li>Sea obsceno, pornográfico o que de alguna manera pueda ofender la dignidad humana.</li>
        <li>Sea abusivo, insultante o amenazante, o que promueva, retrate o fomente la violencia, autolesiones, suicidio, racismo, sexismo, odio o intolerancia.</li>
        <li>Fomente actividades ilegales, incluyendo, sin limitación, terrorismo, incitación al odio racial o cuya transmisión implique la comisión de un delito.</li>
        <li>Sea difamatorio.</li>
        <li>Impulse el envío de "spam".</li>
        <li>Supla la identidad de una persona, empresa o marca con la intención de engañar o confundir a otros.</li>
        <li>Infrinja los derechos de terceros, incluidos los derechos de propiedad intelectual y privacidad.</li>
        <li>Muestra a otra persona sin su conocimiento, y sin que esa persona haya tenido la oportunidad de rechazar tal creación o distribución.</li>
        <li>Contenga imágenes de menores, incluso si tú también estás en la foto, o ponga en peligro a menores.</li>
    </ul>	
<p className="text-gray-700 text-sm">
Por favor, use el sentido común al elegir el contenido que publique, suba o envíe a través de Ibento, ya que es el único responsable de dicho contenido y asume toda la responsabilidad legal relacionada con él.
Contamos con una combinación de tecnologías y moderadores para garantizar que el contenido que se publique cumpla con nuestras normas. Sin embargo, la responsabilidad última recae en el usuario.
En el apartado de garantías sobre el uso de la aplicación, se refiere a que:
(i) Confirma que tiene la capacidad legal para aceptar los términos y condiciones y ser legalmente responsable del uso de la aplicación. Asimismo, al subir la imagen de su identificación oficial (INE) confirma la veracidad de su identidad, brindando su información personal como su CURP, con la finalidad de evitar la duplicidad y uso de identidad. 
(ii) Confirma que tiene la capacidad legal para aceptar los términos y ser legalmente responsable de su uso de la plataforma.
(iii) Se compromete a que toda la información que proporciona al registrarse (como edad, imagen de si identificación oficial, datos de contacto) es precisa y completa.
(iv) Se asegura de que, al usar Ibento, no está violando ninguna ley o regulación en tu país (es decir, tienes el derecho y permiso legal para usar la plataforma).
Estos puntos están diseñados para garantizar que todos los usuarios cumplan con los requisitos legales básicos y que Ibento mantenga un entorno seguro y legal para todos los participantes.

            </p>
          </div>
        </>
      ),
    },
    "4": {
      title: "Restricciones de la Aplicación",
      content: (
        <p className="text-gray-700 text-sm">
          Aceptas los siguientes puntos:
o	Cumplir con todas las leyes aplicables, incluyendo, sin limitación, las leyes de privacidad, propiedad intelectual, anti-spam, leyes de igualdad de oportunidades y regulaciones correspondientes;
o	Utilizar tu nombre y edad reales al crear tu cuenta en Ibento y en tu perfil;
o	Usar los servicios de manera segura, inclusiva y respetuosa.

Asimismo, aceptas que no:
o	Actuarás de manera irrespetuosa, incluyendo ser deshonesto, abusivo o discriminatorio.
o	Falsificarás tu identidad, tu edad, tu posición actual o tu afiliación con cualquier persona o entidad.
o	Divulgarás información que no tengas el consentimiento para divulgar.
o	Acosarás ni perseguirás a ningún usuario en la aplicación.
o	Utilizarás la aplicación de manera engañosa, no auténtica o manipulativa, incluyendo participar en conductas o distribuir contenido relacionado con estafas, spam, perfiles falsos o actividades comerciales y promocionales no autorizadas.
No nos gustan los usuarios que se comportan mal en la comunidad de Ibento. Puedes reportar cualquier abuso o queja sobre el contenido de un miembro contactándonos, describiendo el abuso y/o la queja. También puedes reportar un usuario directamente desde su perfil o en el chat, haciendo clic en el enlace "Bloquear y Reportar". Nos reservamos el derecho de investigar cualquier posible violación de estos Términos, los derechos de cualquier usuario de Ibento o los derechos de terceros. A nuestra entera discreción, podemos terminar inmediatamente el derecho de cualquier usuario a usar la aplicación sin previo aviso, y/o eliminar cualquier contenido inapropiado, infractor o no autorizado enviado a la aplicación.
No controlamos lo que los usuarios dicen o hacen, por lo que eres el único responsable de tus interacciones con otros usuarios de la aplicación.

        </p>
      ),
    },
    "5": {
      title: "Registro y Verificación de Identidad",
      content: (
        <p className="text-gray-700 text-sm">
          Para poder acceder a las funcionalidades de la plataforma, el usuario deberá registrarse. Este proceso incluye:
o	Proveer una dirección de correo electrónico válida.
o	Crear una contraseña que cumpla con los criterios mínimos de seguridad (mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números).
o	Seleccionar las categorías de los eventos que al usuario le interese para poder sugerir evento según sus gustos.
Ahora bien, para la funcionalidad de buscar un acompañante para algún evento, el usuario deberá:
o	Subir una imagen de su identificación oficial (INE), de ambos lados y tomarse una fotografía en tiempo real para autenticar su identidad mediante tecnología de reconocimiento de imágenes.
o	Seleccionar varias opciones con las que el usuario se identifique, estas están predeterminadas por la aplicación y se hace con la finalidad de poder encontrar una mejor opción de acompañantes para el usuario.

        </p>
      ),
    },
    "6": {
      title: "Funcionalidades de la Aplicación",
      content: (
        <p className="text-gray-700 text-sm">
          o	Recomendación de Eventos: La aplicación sugerirá eventos a los usuarios basándose en sus preferencias previas y proximidad geográfica.
o	Sistema de Match: La aplicación permitirá a los usuarios encontrar acompañantes basados en intereses, y preferencias personales. Los usuarios podrán aceptar o rechazar sugerencias de acompañantes.
o	Sistema de Mensajería: Una vez confirmado el "match", los usuarios podrán enviar y recibir mensajes a través del sistema de chat de la aplicación. Para proteger la privacidad de las conversaciones, el sistema de chat estará encriptado.
o	Notificaciones: Los usuarios recibirán notificaciones sobre nuevos eventos, cambios en eventos guardados y recomendaciones personalizadas de eventos de acuerdo con sus intereses.
o	Creación y Gestión de Eventos: Los usuarios podrán crear, actualizar y eliminar eventos, así como guardar eventos de interés. Los eventos se pueden consultar según filtros de tipo de evento, ubicación, fecha y costo.

        </p>
      ),
    },
    "7": {
      title: "Obligación del Usuario",
      content: (
        <p className="text-gray-700 text-sm">
          El Usuario se compromete a:
o	Usar la aplicación únicamente para los fines previstos y conforme a estos Términos.
o	Proporcionar información veraz y actualizada durante el registro y la verificación de identidad.
o	Mantener la confidencialidad de sus credenciales de acceso.
o	No utilizar la aplicación para fines ilegales, fraudulentos o contrarios a la moral y el orden público.
o	No compartir información personal de otros usuarios sin su consentimiento explícito.

        </p>
      ),
    },
    };

    const privacidadSections = {
  "0": {
    title: "¿Quiénes somos?",
    content: (
      <p className="text-gray-700 text-sm">
        Si vives en la Ciudad de México, México, la compañía responsable para el control de tu información es:
        <br/>
        Ibento, Inc<br/>
        ESCOM IPN<br/>
        Av. Juan de Dios Bátiz<br/>
        Unidad Profesional Adolfo López Mateos<br/>
        Gustavo A. Madero, Ciudad de México<br/>
        México<br/>
        Ibento actúa como controlador de tus datos de información personal que es recopilada y procesada a través de la App.

      </p>
    ),
  },
  "1": {
    title: "¿Dónde aplica el aviso de privacidad?",
    content: (
        <>
            <p className="text-gray-700 text-sm">
                Este aviso de privacidad aplica para la aplicación web progresiva y todos los futuros servicios que actúen bajo la marca de Ibento. A su vez, aplica para todos aquellos que hayan hecho uso de la aplicación, sea para obtener sugerencias de eventos o para buscar un acompañante.
            </p>
            <h3 className="text-lg font-medium mb-2">Datos recopilados</h3>
            <h4 className="text-md font-medium mb-2">Datos que solicitamos</h4>
            <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b text-left">Categoría</th>
            <th className="px-4 py-2 border-b text-left">Descripción</th>
            <th className="px-4 py-2 border-b text-left">Datos recolectados</th>
          </tr>
        </thead>
        <tbody>
          {/* Datos de la cuenta */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              Datos de la cuenta
            </td>
            <td className="px-4 py-2 border-b align-top">
              Información básica que es necesaria para que configure su cuenta.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Dirección de correo electrónico</li>
                <li>Fecha de nacimiento</li>
              </ul>
            </td>
          </tr>
          {/* Datos del perfil */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              Datos del perfil
            </td>
            <td className="px-4 py-2 border-b align-top">
              Detalles adicionales del perfil de la cuenta que nos permitirá
              recomendar con mayor exactitud eventos y personas. Si decide
              brindar esta información, usted nos autoriza a usarla según se
              establece en este Aviso de privacidad.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Nombre</li>
                <li>Apellidos</li>
                <li>Identidad de género</li>
                <li>Orientación sexual</li>
                <li>Intereses</li>
                <li>Preferencias</li>
                <li>Ubicación aproximada</li>
              </ul>
            </td>
          </tr>
          {/* Contenido */}
          <tr>
            <td className="px-4 py-2 border-b align-top">Contenido</td>
            <td className="px-4 py-2 border-b align-top">
              <span className="text-gray-400">
                ---------------------------------------------
              </span>
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Fotos</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <h4 className="text-md font-medium mb-2">Datos generados</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b text-left">Categoría</th>
            <th className="px-4 py-2 border-b text-left">Descripción</th>
            <th className="px-4 py-2 border-b text-left">Datos recolectados</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border-b align-top">Datos de uso</td>
            <td className="px-4 py-2 border-b align-top">
              El servicio genera datos sobre su actividad.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
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
    <h4 className="text-md font-medium mb-2">Datos recopilados con su permiso</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b text-left">Categoría</th>
            <th className="px-4 py-2 border-b text-left">Descripción</th>
            <th className="px-4 py-2 border-b text-left">Datos recolectados</th>
          </tr>
        </thead>
        <tbody>
          {/* Datos de geolocalización */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              Datos de geolocalización
            </td>
            <td className="px-4 py-2 border-b align-top">
              Si nos da permiso, podemos recopilar su ubicación geográfica.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Latitud</li>
                <li>Longitud</li>
              </ul>
            </td>
          </tr>
          {/* Datos de geometría facial */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              Datos de geometría facial
            </td>
            <td className="px-4 py-2 border-b align-top">
              Para poder realizar la verificación de la cuenta, es necesario el
              procesamiento de datos de su geometría facial, ósea el uso de sus
              datos biométricos.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Datos biométricos</li>
              </ul>
            </td>
          </tr>
          {/* Datos de identificación */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              Datos de identificación
            </td>
            <td className="px-4 py-2 border-b align-top">
              Para verificar su cuenta, nos puede proporcionar una copia de su
              identificación emitida por el gobierno.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>INE</li>
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
      </p>
      <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b text-left">
              Propósitos del procesamiento de sus datos
            </th>
            <th className="px-4 py-2 border-b text-left">
              Fundamentos para procesar sus datos
            </th>
            <th className="px-4 py-2 border-b text-left">
              Categorías de datos procesados
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Primer grupo de propósitos */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Crear su cuenta y su perfil en nuestro servicio.</li>
                <li>
                  Recomendarle eventos en los que puede estar interesado.
                </li>
                <li>
                  Recomendarle a usted diferentes acompañantes y recomendarlo a ellos.
                </li>
              </ul>
            </td>
            <td className="px-4 py-2 border-b align-top">
              Poder ofrecerle nuestro servicio.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Datos de la cuenta</li>
                <li>Datos del perfil</li>
                <li>Datos de geolocalización</li>
              </ul>
            </td>
          </tr>
          {/* Segundo grupo de propósitos */}
          <tr>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>
                  Verificación de su cuenta, prevenir el fraude y garantizar la
                  seguridad de nuestros Usuarios.
                </li>
              </ul>
            </td>
            <td className="px-4 py-2 border-b align-top">
              Obtener su consentimiento para hacer uso de datos confidenciales o
              datos de otro tipo.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
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
      </p>
      <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b text-left">Destinatarios</th>
            <th className="px-4 py-2 border-b text-left">Razones para compartir</th>
            <th className="px-4 py-2 border-b text-left">Categorías</th>
          </tr>
        </thead>
        <tbody>
          {/* Otros miembros */}
          <tr>
            <td className="px-4 py-2 border-b align-top">Otros miembros</td>
            <td className="px-4 py-2 border-b align-top">
              Compartimos datos suyos con otros miembros en el momento en que pone información suya en el servicio (perfil).
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
                <li>Datos del perfil</li>
                <li>Contenido</li>
              </ul>
            </td>
          </tr>
          {/* Proveedores de servicios */}
          <tr>
            <td className="px-4 py-2 border-b align-top">Proveedores de servicios</td>
            <td className="px-4 py-2 border-b align-top">
              Compartimos datos con aquellos socios que nos permiten operar el servicio. El gestor de información.
            </td>
            <td className="px-4 py-2 border-b align-top">
              <ul className="list-disc pl-5">
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
       <p className="text-gray-700 text-sm">
        Leyes de privacidad aplicables en tu país.
Por el simple hecho de hacer uso de nuestra aplicación, usted se hace acreedor de los siguientes derechos, opciones y herramientas disponibles. Esto porque, nosotros como Ibento, busca que tenga el control de sus datos.
El usuario tiene derecho a:
<br/>
1.	Derecho a ser informados sobre los datos personales que fueron procesados y en que son utilizados.<br/>
2.	Derecho a modificar o actualizar sus datos personales en caso de que estén inexactos o incorrectos.<br/>
3.	Derecho a solicitar una copia de sus datos.<br/>
4.	Derecho a que se eliminen sus datos personales cuando elimine su cuenta.<br/>
5.	Derecho a oponerse a que procesemos sus datos personales.<br/>
6.	Derecho a modificar los permisos y consentimientos previamente otorgados a la aplicación como lo es: información visible en el perfil, acceso a la ubicación, acceso a la cámara, visibilidad global en emparejamiento y acceso a galería. 

      </p>
    ),
  },
  "5": {
    title: "Ubicación de los datos y cuánto tiempo conservamos sus datos",
    content: (
      <p className="text-gray-700 text-sm">
        Toda la información recabada en la aplicación estará ubicada en servidores y centros de datos de terceros, específicamente servidores utilizados por la base de datos en la nube de MongoDB. 
En caso de que decida dejar de usar nuestro servicio, su cuenta y perfil ya podrá ser accedida por otros usuarios en la aplicación. Una vez eliminada que decida eliminar su cuenta, la información será eliminada en el transcurso de lo que tarde en procesar la petición el servidor. 
      </p>
    ),
  },
  "6": {
    title: "Nuestra política en materia de edad",
    content: (
      <p className="text-gray-700 text-sm">
        Para hacer uso de la aplicación, el usuario debe tener por lo menos 18 años. Y esto se verifica al acceder al apartado de emparejamiento, donde se solicitará una identificación oficial con la que se el usuario pueda comprobar esta información.
      </p>
    ),
  },
  "7": {
    title: "Seguridad",
    content: (
        <p className="text-gray-700 text-sm">
           Nosotros como Ibento, queremos usar todos los medios disponibles para asegurar la protección de usted y de su información. Es por lo que, aparte de las medidas que usamos en el servicio, queremos que usted siga estas medidas para evitar cualquier tipo de perdida de datos, acceso desautorizado, etc.
            <br/>
1.	No compartir su contraseña.<br/>
2.	Cambia cada 6 meses su contraseña y siga las indicaciones para tener una contraseña fuerte.<br/>
3.	Cierra la sesión cada vez que use la aplicación en dispositivos ajenos. <br/>
Ante cualquier sospecha de que alguien ha tenido acceso a tu cuenta, favor de contactar al siguiente correo: <br/>
<strong>atencionalcliente@ibentoapp.com</strong>
 
        </p>
    )
  },
  "8": {
    title: "Cambios en la política",
    content: (
        <p className="text-gray-700 text-sm">
        La política implementada por Ibento puede cambiar a lo largo del tiempo. En base con cómo va cambiando el panorama y la tecnología, buscamos mantenernos actualizados con las practicas con las que se procesan los datos, teniendo siempre como objetivo mantener un alto estándar en la protección de datos del usuario. Siempre puede acceder a la última versión de la política de privacidad en la aplicación web progresiva.  
        </p>
    )
  }
    };

    return (
  <div className="flex flex-col h-160 bg-white">
    <div className="flex border-b px-2">
      <button
        className={`flex-1 py-3 text-center font-medium ${
          activeTab === "terminos"
            ? "text-purple-800 border-b-2 border-purple-800"
            : "text-gray-500"
        }`}
        onClick={() => {
          setActiveTab("terminos");
          setActiveSection("0");
        }}
      >
        Términos y Condiciones
      </button>
      <button
        className={`flex-1 py-3 text-center font-medium ${
          activeTab === "privacidad"
            ? "text-purple-800 border-b-2 border-purple-800"
            : "text-gray-500"
        }`}
        onClick={() => {
          setActiveTab("privacidad");
          setActiveSection("0");
        }}
      >
        Aviso de Privacidad
      </button>
    </div>

    <div className="flex h-full">
      <div className="w-16 bg-purple-200 p-2">
        <ul className="space-y-4">
          {Object.keys(activeTab === "terminos" ? sections : privacidadSections).map((item) => (
            <li
              key={item}
              className={`py-2 px-3 text-center cursor-pointer ${
                activeSection === item
                  ? "text-purple-800 font-bold"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveSection(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <h1 className="text-xl font-medium text-purple-800 mb-4">
          {activeTab === "terminos" ? "Términos y condiciones" : "Aviso de Privacidad"}
        </h1>

        <h2 className="text-lg font-medium text-[#2a5885] mb-3">
          {activeTab === "terminos" 
            ? sections[activeSection].title 
            : privacidadSections[activeSection].title}
        </h2>

        {activeTab === "terminos" 
          ? sections[activeSection].content 
          : privacidadSections[activeSection].content}
      </div>
    </div>
  </div>
);

};

export default Page;
