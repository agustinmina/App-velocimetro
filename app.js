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

// Escucha a que el puente nativo esté listo
document.addEventListener('deviceready', checkPermissions, false);

function checkPermissions() {
    statusElement.textContent = "SOLICITANDO PERMISO...";
    
    var permissions = cordova.plugins.permissions;
    // Verifica si ya tiene permiso de GPS exacto
    permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function(status) {
        if (status.hasPermission) {
            startGPS();
        } else {
            // Si no tiene, fuerza la ventana nativa de Android
            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function(status) {
                if (status.hasPermission) {
                    startGPS();
                } else {
                    statusElement.textContent = "PERMISO DENEGADO";
                    statusElement.style.color = "#ff0044";
                }
            }, function() {
                statusElement.textContent = "ERROR AL PEDIR PERMISOS";
                statusElement.style.color = "#ff0044";
            });
        }
    }, function() {
        statusElement.textContent = "ERROR INTERNO DE PERMISOS";
        statusElement.style.color = "#ff0044";
    });
}

function startGPS() {
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
                statusElement.textContent = "ERROR AL LEER EL SENSOR GPS";
                statusElement.style.color = "#ff0044";
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    }
}
