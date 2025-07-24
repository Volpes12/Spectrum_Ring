const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const audioFileInput = document.getElementById('audioFile');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext, analyser, source, dataArray;
let rotationAngle = 0; // Initial rotation angle for the disk

audioFileInput.addEventListener('change', (event) => {
    if (audioContext) audioContext.close(); // Close previous context

    const file = event.target.files[0];
    if (!file) return;

    const audio = new Audio(URL.createObjectURL(file));
    audio.controls = true;
    document.body.appendChild(audio);
    audio.play();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Defines resolution of frequency data

    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    animate(); // Start visualization
});

function animate() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 160; // Inner circle size
    const bars = dataArray.length;
    const angleStep = (Math.PI * 2) / bars;

    // Draw the rotating disk
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);
    ctx.fillStyle = "Red"; // Disk color
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    rotationAngle += 0.03; // Increase angle for smooth rotation

    for (let i = 0; i < bars; i++) {
        const value = dataArray[i];
        const barHeight = value * 0.9; // Scale the height
        const angle = i * angleStep;

        // Calculate start and end points of bars
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.strokeStyle = `hsl(${i * 5}, 100%, 50%)`; // Color variation
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Draw rotating name text around the spectrum ring
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle); // rotate the full text path

    const text = "VPSK";
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charAngle = (i - text.length / 2) * (Math.PI / 64); // spread letters
        const charRadius = radius + 30;

        const x = Math.cos(charAngle) * charRadius;
        const y = Math.sin(charAngle) * charRadius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(charAngle + Math.PI / 2); // rotate each letter upright
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    ctx.restore();


    requestAnimationFrame(animate); // Keep updating
}
