// Obtención de los elementos video y canvas del DOM por su ID
const video = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');

// Definición de la URL base para los modelos de la librería faceapi.js
const MODEL_URL = '/public/models';

// Función asincrónica para cargar los modelos necesarios de faceapi.js
async function loadModels() {
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);
}
// Llamada a la función para cargar los modelos
loadModels();

// Función asincrónica que se ejecuta al reproducir el video
async function onPlay() {
    // Si el video está pausado o terminado, se retrasa la ejecución
    if (video.paused || video.ended) return setTimeout(() => onPlay());

    // Detección de rostros y sus características
    let fullFaceDescriptions = await faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

    // Ajuste de las dimensiones de detección al tamaño del canvas
    const dims = faceapi.matchDimensions(canvas, video, true);
    const resizedResults = faceapi.resizeResults(fullFaceDescriptions, dims);

    // Limpieza del canvas antes de dibujar los nuevos resultados
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar detecciones, puntos de referencia y expresiones faciales en el canvas
    faceapi.draw.drawDetections(canvas, resizedResults);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
    faceapi.draw.drawFaceExpressions(canvas, resizedResults, 0.05);

    // Uso de requestAnimationFrame para una actualización fluida de los gráficos
    requestAnimationFrame(onPlay);
}

// Función autoejecutable para obtener acceso a la cámara web
(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    onPlay();
})();