const speedElement = document.getElementById('speed');
const statusElement = document.getElementById('status');

if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
        (position) => {
            const speed = position.coords.speed;
            if (speed !== null) {
                const speedKmh = (speed * 3.6).toFixed(0);
                speedElement.textContent = speedKmh;
                statusElement.textContent = "Conectado";
                statusElement.style.color = "#00ff00";
            } else {
                speedElement.textContent = "0";
                statusElement.textContent = "Señal estable";
                statusElement.style.color = "#00ff00";
            }
        },
        (error) => {
            statusElement.textContent = "Error GPS";
            statusElement.style.color = "#ff0000";
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
} else {
    statusElement.textContent = "Sin soporte GPS";
    statusElement.style.color = "#ff0000";
}
