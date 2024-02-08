// Obtiene elementos del DOM: el video y el canvas para mostrar la cámara web y los resultados del reconocimiento facial.
const video = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');

// Función autoinvocada para iniciar la cámara web.
(async () => {
    // Solicita acceso a la cámara web del usuario.
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    // Establece el stream de la cámara web como la fuente del elemento de video.
    video.srcObject = stream;
    console.log(video); // Imprime el elemento de video en la consola para depuración.
})();

// Función asincrónica 'onPlay' para procesar el video y realizar el reconocimiento facial.
async function onPlay() {
    // URL del modelo para cargar los modelos de reconocimiento facial.
    const MODEL_URL = '/public/models';

    // Carga los modelos de reconocimiento facial de face-api.js.
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);

    // Detecta todas las caras en el video, con detalles faciales y expresiones.
    let fullFaceDescriptions = await faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

    // Ajusta las dimensiones de los resultados al canvas.
    const dims = faceapi.matchDimensions(canvas, video, true);
    const resizedResults = faceapi.resizeResults(fullFaceDescriptions, dims);

    // Dibuja los resultados en el canvas: detecciones, puntos faciales y expresiones.
    faceapi.draw.drawDetections(canvas, resizedResults);
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
    faceapi.draw.drawFaceExpressions(canvas, resizedResults, 0.05);

    // Llama a 'onPlay' cada 100 ms para actualizar los resultados.
    setTimeout(() => onPlay(), 100);
}
