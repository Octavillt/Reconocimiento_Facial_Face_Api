/**
 * Uso de faceapi.js para reconocimiento facial en una aplicación web.
 * Esta línea es un comentario para indicar que el código a continuación está relacionado con el uso de la biblioteca faceapi.js, 
 * que es una popular librería de JavaScript para el reconocimiento facial.
 * Obtención de elementos del DOM para la visualización de video y resultados.
 * Aquí empezamos a interactuar con la interfaz de usuario de la página web.
*/

/**
 * Esta línea crea una constante llamada 'video'.
 * document.getElementById('inputVideo') obtiene un elemento del DOM (Document Object Model) cuyo ID es 'inputVideo'.
 * Normalmente, este elemento es un tag de video en el HTML donde se mostrará el video capturado por la cámara web o un archivo de video.
*/
const video = document.getElementById('inputVideo');
/**
 * Esta línea crea una constante llamada 'canvas'.
 * document.getElementById('overlay') obtiene un elemento del DOM cuyo ID es 'overlay'.
 * Este elemento 'canvas' se utiliza para dibujar gráficos en la página web, como las anotaciones o marcadores del reconocimiento facial.
*/
const canvas = document.getElementById('overlay');
/**
 * Esta línea crea una constante llamada 'canvasContext'.
 * canvas.getContext('2d') es un método que proporciona un contexto de renderizado en dos dimensiones para el elemento canvas.
 * El contexto del canvas es el objeto que se utiliza efectivamente para dibujar y manipular gráficos en el canvas.
 * El segundo argumento, { willReadFrequently: true }, es una pista de optimización.
 * Indica al navegador que el contenido del canvas se leerá frecuentemente (como en una aplicación de reconocimiento facial en tiempo real),
 * lo que puede ayudar al navegador a optimizar el rendimiento.
 */
const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

/**
 * URL base para cargar los modelos de faceapi.js.
 * Esta línea define una constante llamada 'MODEL_URL' que guarda la URL base donde se encuentran los modelos de faceapi.js.
 * '/public/models' es una ruta que generalmente se refiere a un directorio en el servidor donde se aloja la aplicación web.
 * En este directorio se esperan encontrar los modelos de machine learning que utiliza faceapi.js.
 */
const MODEL_URL = '/public/models';

/**
 * Función asincrónica para cargar los modelos necesarios de faceapi.js.
 * Aquí se declara una función asincrónica llamada 'loadModels'.
 * Una función asincrónica es una función que opera de manera asincrónica a través del evento loop, 
 * permitiendo esperar por promesas sin bloquear la ejecución del código.
 */
async function loadModels() {
    /**
     * Dentro de esta función se cargarán los modelos necesarios para el reconocimiento facial.
     * Carga secuencial de los modelos de detección facial, puntos de referencia, reconocimiento y expresiones.
     */

    /**
     * 'await' es utilizado para esperar a que se resuelva la promesa retornada por faceapi.loadSsdMobilenetv1Model(MODEL_URL).
     * Esta línea carga el modelo SSD MobileNet v1, que es un modelo de detección facial.
     * await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
     */
    await faceapi.loadFaceLandmarkModel(MODEL_URL);

    /**
     * Esta línea carga el modelo de reconocimiento facial, que permite identificar y diferenciar entre diferentes rostros.
     * Similar a la línea anterior, esta espera a que se cargue el modelo de puntos de referencia faciales.
     * Este modelo es útil para identificar puntos específicos en la cara, como los bordes de la boca o los ojos.
     */
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    /**
     * Finalmente, esta línea carga el modelo de expresiones faciales, que puede detectar expresiones como felicidad, tristeza, sorpresa, etc.
     */
    await faceapi.loadFaceExpressionModel(MODEL_URL);
}

/**
 * Función asincrónica que se ejecuta en cada cuadro del video para realizar el reconocimiento facial.
 * Aquí declaramos una función asincrónica llamada 'onPlay'.
 * Esta función se diseñó para ejecutarse en cada cuadro (frame) del video, realizando el proceso de reconocimiento facial.
 */
async function onPlay() {
    /**
     * Verifica si el video está pausado o terminado para retrasar la ejecución.
     * Este condicional verifica si el video está pausado o ha terminado.
     * Si alguna de estas condiciones es verdadera, se utiliza 'setTimeout' para retrasar la ejecución de 'onPlay'.
     * Esto evita que la función se ejecute innecesariamente cuando el video no está activo.
     */
    if (video.paused || video.ended) return setTimeout(() => onPlay());

    /**
     * Realiza la detección de rostros y sus características en el video.
     * En esta parte se realiza la detección de rostros usando 'faceapi.detectAllFaces'.
     * Se encadena con métodos adicionales para detectar puntos de referencia en el rostro ('withFaceLandmarks'),
     * descriptores de rostro para el reconocimiento facial ('withFaceDescriptors'),
     * y expresiones faciales ('withFaceExpressions').
     * Todo esto se hace de manera asincrónica y se guarda en 'fullFaceDescriptions'.
     */
    let fullFaceDescriptions = await faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

    /**
     * Ajusta las dimensiones de detección al tamaño del canvas y limpia el canvas.
     * 'faceapi.matchDimensions' ajusta las dimensiones de detección al tamaño del canvas.
     * Esto es importante para que las anotaciones se dibujen correctamente sobre el video.
    */
    const dims = faceapi.matchDimensions(canvas, video, true);

    /**
     * 'faceapi.resizeResults' redimensiona los resultados de la detección para que coincidan con las dimensiones ajustadas.
     */
    const resizedResults = faceapi.resizeResults(fullFaceDescriptions, dims);

    /**
     * 'canvasContext.clearRect' limpia el canvas, lo cual es necesario para dibujar las nuevas anotaciones
     * sin acumular las anotaciones de cuadros anteriores.
     */
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    /**
     * Dibuja las detecciones y características faciales en el canvas.
     * Estas líneas dibujan las detecciones y características faciales en el canvas.
     * Incluyen las cajas de detección de rostros, los puntos de referencia y las expresiones faciales.
     */
    faceapi.draw.drawDetections(canvas, resizedResults);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
    faceapi.draw.drawFaceExpressions(canvas, resizedResults, 0.05);


    /**
     * Actualización continua utilizando requestAnimationFrame.
     * Finalmente, 'requestAnimationFrame(onPlay)' se utiliza para crear un bucle.
     * Esto significa que 'onPlay' se llamará nuevamente para el próximo cuadro, 
     * permitiendo que el reconocimiento facial se actualice continuamente mientras el video esté activo.
     */
    requestAnimationFrame(onPlay);

}

/**
 * Función autoejecutable para iniciar el proceso de reconocimiento facial.
 * Esta es una función inmediatamente invocada (también conocida como IIFE, por sus siglas en inglés: Immediately Invoked Function Expression).
 * Se utiliza para ejecutar código tan pronto como se define, lo que es útil para tareas de inicialización como la que se va a realizar.
 * Esta es una función anónima asincrónica que se ejecuta automáticamente.
 */
(async () => {

    /**
     * Carga los modelos y obtiene acceso a la cámara web.
     * Primero, se llama a la función 'loadModels' que hemos definido anteriormente.
     * Esta función carga los modelos necesarios para el reconocimiento facial.
     * 'await' asegura que la ejecución de la siguiente línea espere hasta que todos los modelos estén cargados.
     */
    await loadModels();

    /**
     * Esta línea obtiene el acceso a la cámara web.
     * 'navigator.mediaDevices.getUserMedia' es una función del API de WebRTC que solicita acceso a los dispositivos de media, 
     * en este caso, únicamente al video (cámara web).
     * 'await' es usado aquí para esperar a que el usuario conceda el permiso y la cámara web se active.
     */
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });

    /**
     * Una vez obtenido el stream de la cámara, se establece como el 'srcObject' del elemento de video.
     * Esto hace que el video capturado por la cámara web se muestre en el elemento de video en la página web.
     */
    video.srcObject = stream;

    /**
     * Inicia el proceso de reconocimiento facial.
     * Luego se llama a la función 'onPlay' que definimos previamente.
     * Esta función iniciará el proceso de reconocimiento facial en el video en tiempo real.
     */
    onPlay();

})();
/**
 * Los paréntesis finales '()' causan que la función se ejecute inmediatamente después de su definición.
 */
