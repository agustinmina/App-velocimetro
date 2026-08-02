const speedElement = document.getElementById('speed');
const statusElement = document.getElementById('status');
const circle = document.querySelector('.progress-ring__circle');
const tripDistElement = document.getElementById('trip-dist');
const totalDistElement = document.getElementById('total-dist');

const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI; 
const maxDash = circumference;
const minDash = circumference * 0.25; 
const MAX_SPEED = 160; 

let tripDistance = 0; 
let totalDistance = parseFloat(localStorage.getItem('total_distance')) || 0;
let lastLat = null;
let lastLon = null;

totalDistElement.textContent = totalDistance.toFixed(2);

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

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

setSpeed(0);

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Mantener la app activa en segundo plano con notificación
    if (cordova.plugins && cordova.plugins.backgroundMode) {
        cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.setDefaults({
            title: "Velocímetro Activo",
            text: "Midiendo velocidad y distancia en segundo plano",
            ticker: "Velocímetro en marcha"
        });
    }

    // Evitar que la pantalla se apague sola mientras usas la app
    if (window.plugins && window.plugins.insomnia) {
        window.plugins.insomnia.keepAwake();
    }

    checkPermissions();
}

function checkPermissions() {
    statusElement.textContent = "SOLICITANDO PERMISOS...";
    var permissions = cordova.plugins.permissions;
    
    permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function(status) {
        if (status.hasPermission) {
            startGPS();
        } else {
            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function(status) {
                if (status.hasPermission) {
                    startGPS();
                } else {
                    statusElement.textContent = "PERMISO DENEGADO";
                    statusElement.style.color = "#ff0044";
                }
            }, function() {
                statusElement.textContent = "ERROR DE PERMISOS";
                statusElement.style.color = "#ff0044";
            });
        }
    }, function() {
        statusElement.textContent = "ERROR INTERNO";
        statusElement.style.color = "#ff0044";
    });
}

function startGPS() {
    statusElement.textContent = "BUSCANDO SATÉLITES...";
    
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const speed = position.coords.speed;
                const currentLat = position.coords.latitude;
                const currentLon = position.coords.longitude;

                if (lastLat !== null && lastLon !== null) {
                    const distanceDelta = calculateDistance(lastLat, lastLon, currentLat, currentLon);
                    if (distanceDelta < 1.0) {
                        tripDistance += distanceDelta;
                        totalDistance += distanceDelta;

                        tripDistElement.textContent = tripDistance.toFixed(2);
                        totalDistElement.textContent = totalDistance.toFixed(2);
                        
                        localStorage.setItem('total_distance', totalDistance);
                    }
                }
                lastLat = currentLat;
                lastLon = currentLon;

                if (speed !== null) {
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
                statusElement.textContent = "ERROR DE LECTURA GPS";
                statusElement.style.color = "#ff0044";
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    }
}
