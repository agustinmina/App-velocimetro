const speedElement = document.getElementById('speed');
const statusElement = document.getElementById('status');
const circle = document.querySelector('.progress-ring__circle');

// Matemáticas para el tacómetro
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI; 
const maxDash = circumference;
const minDash = circumference * 0.25; 

// Topamos el velocímetro a 160 km/h para el llenado del arco
const MAX_SPEED = 160; 

function setSpeed(speedKmh) {
    speedElement.textContent = speedKmh;

    // Calcular cuánto se llena la barra
    let speedPercent = speedKmh / MAX_SPEED;
    if (speedPercent > 1) speedPercent = 1; 
    
    const offset = maxDash - (speedPercent * (maxDash - minDash));
    circle.style.strokeDashoffset = offset;

    // Cambiar colores dinámicos
    document.body.className = ''; 
    if (speedKmh < 50) {
        document.body.classList.add('color-normal');
    } else if (speedKmh >= 50 && speedKmh < 80) {
        document.body.classList.add('color-warning');
    } else {
        document.body.classList.add('color-danger');
    }
}

// Inicializamos en 0
setSpeed(0);

if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
        (position) => {
            const speed = position.coords.speed;
            if (speed !== null) {
                // Convertir m/s a km/h
                const speedKmh = Math.round(speed * 3.6);
                setSpeed(speedKmh);
                statusElement.textContent = "GPS CONECTADO";
                statusElement.style.color = "#00ff00";
            } else {
                setSpeed(0);
                statusElement.textContent = "SEÑAL ESTABLE";
                statusElement.style.color = "#00ff00";
            }
        },
        (error) => {
            statusElement.textContent = "ERROR GPS: REVISA PERMISOS DE UBICACIÓN";
            statusElement.style.color = "#ff0044";
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
} else {
    statusElement.textContent = "DISPOSITIVO NO COMPATIBLE";
    statusElement.style.color = "#ff0044";
}
