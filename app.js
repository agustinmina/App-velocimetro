const speedElement = document.getElementById('speed');
const statusElement = document.getElementById('status');
const circle = document.querySelector('.progress-ring__circle');

const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI; 
const maxDash = circumference;
const minDash = circumference * 0.25; 
const MAX_SPEED = 160; 

function setSpeed(speedKmh) {
    speedElement.textContent = speedKmh;

    let speedPercent = speedKmh / MAX_SPEED;
    if (speedPercent > 1) speedPercent = 1; 
    
    const offset = maxDash - (speedPercent * (maxDash - minDash));
    circle.style.strokeDashoffset = offset;

    document.body.className = ''; 
    if (speedKmh < 50) {
        document.body.classList.add('color-normal');
    } else if (speedKmh >= 50 && speedKmh < 80) {
        document.body.classList.add('color-warning');
    } else {
        document.body.classList.add('color-danger');
    }
}

setSpeed(0);

// ESPERAR A QUE ANDROID ESTÉ LISTO ANTES DE PEDIR EL GPS
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    statusElement.textContent = "BUSCANDO SATÉLITES...";
    
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const speed = position.coords.speed;
                if (speed !== null) {
                    const speedKmh = Math.round(speed * 3.6);
                    setSpeed(speedKmh);
                    statusElement.textContent = "GPS CONECTADO";
                    statusElement.style.color = "#00ff00";
                } else {
                    setSpeed(0);
                    statusElement.textContent = "SEÑAL ESTABLE (SIN MOVIMIENTO)";
                    statusElement.style.color = "#00ff00";
                }
            },
            (error) => {
                statusElement.textContent = "ERROR: ACEPTA EL PERMISO DE UBICACIÓN";
                statusElement.style.color = "#ff0044";
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    } else {
        statusElement.textContent = "DISPOSITIVO NO COMPATIBLE";
        statusElement.style.color = "#ff0044";
    }
}
