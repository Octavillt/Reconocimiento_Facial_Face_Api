// Uso de faceapi.js para reconocimiento facial en una aplicación web.

// Obtención de elementos del DOM para la visualización de video y resultados.
const video = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');
const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

// URL base para cargar los modelos de faceapi.js.
const MODEL_URL = '/public/models';

/**
 * Función asincrónica para cargar los modelos necesarios de faceapi.js.
 */
async function loadModels() {
    // Carga secuencial de los modelos de detección facial, puntos de referencia, reconocimiento y expresiones.
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);
}

/**
 * Función asincrónica que se ejecuta en cada cuadro del video para realizar el reconocimiento facial.
 */
async function onPlay() {
    // Verifica si el video está pausado o terminado para retrasar la ejecución.
    if (video.paused || video.ended) return setTimeout(() => onPlay());

    // Realiza la detección de rostros y sus características en el video.
    let fullFaceDescriptions = await faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

    // Ajusta las dimensiones de detección al tamaño del canvas y limpia el canvas.
    const dims = faceapi.matchDimensions(canvas, video, true);
    const resizedResults = faceapi.resizeResults(fullFaceDescriptions, dims);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja las detecciones y características faciales en el canvas.
    faceapi.draw.drawDetections(canvas, resizedResults);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
    faceapi.draw.drawFaceExpressions(canvas, resizedResults, 0.05);

    // Actualización continua utilizando requestAnimationFrame.
    requestAnimationFrame(onPlay);
}

// Función autoejecutable para iniciar el proceso de reconocimiento facial.
(async () => {
    // Carga los modelos y obtiene acceso a la cámara web.
    await loadModels();
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    // Inicia el proceso de reconocimiento facial.
    onPlay();
})();
