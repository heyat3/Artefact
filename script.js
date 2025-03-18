document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const brushSize = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const colorPicker = document.getElementById('colorPicker');
    const rainbowBtn = document.getElementById('rainbowBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (!canvas) {
        console.error('Could not find canvas element');
        return;
    }

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let activeSymmetry = 'none';
    let isErasing = false;
    let isRainbowMode = false;
    let lastColor = colorPicker.value;
    let hue = 0;

    // Set initial drawing styles
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Initialize canvas with white background
    function clearCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function saveDrawing() {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top)
        };
    }

    function updateRainbowColor() {
        hue = (hue + 1) % 360;
        return `hsl(${hue}, 100%, 50%)`;
    }

    function drawLine(x1, y1, x2, y2) {
        if (isRainbowMode && !isErasing) {
            ctx.strokeStyle = updateRainbowColor();
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function drawSymmetric(x1, y1, x2, y2) {
        // Draw the main line
        drawLine(x1, y1, x2, y2);
        
        if (activeSymmetry === 'horizontal') {
            // Draw horizontally mirrored line
            const mirrorY1 = canvas.height - y1;
            const mirrorY2 = canvas.height - y2;
            drawLine(x1, mirrorY1, x2, mirrorY2);
        } 
        else if (activeSymmetry === 'vertical') {
            // Draw vertically mirrored line
            const mirrorX1 = canvas.width - x1;
            const mirrorX2 = canvas.width - x2;
            drawLine(mirrorX1, y1, mirrorX2, y2);
        }
        else if (activeSymmetry === 'quad') {
            // Draw both horizontal and vertical mirrors
            const mirrorX1 = canvas.width - x1;
            const mirrorX2 = canvas.width - x2;
            const mirrorY1 = canvas.height - y1;
            const mirrorY2 = canvas.height - y2;
            
            drawLine(mirrorX1, y1, mirrorX2, y2);  // Vertical mirror
            drawLine(x1, mirrorY1, x2, mirrorY2);  // Horizontal mirror
            drawLine(mirrorX1, mirrorY1, mirrorX2, mirrorY2);  // Diagonal mirror
        }
    }

    function toggleEraser() {
        isErasing = !isErasing;
        if (isErasing) {
            lastColor = ctx.strokeStyle;
            ctx.strokeStyle = 'white';
            eraserBtn.classList.add('active');
            canvas.classList.add('eraser-active');
            // Disable rainbow mode when eraser is active
            isRainbowMode = false;
            rainbowBtn.classList.remove('active');
            canvas.classList.remove('rainbow-active');
        } else {
            ctx.strokeStyle = lastColor;
            eraserBtn.classList.remove('active');
            canvas.classList.remove('eraser-active');
        }
    }

    function toggleRainbow() {
        isRainbowMode = !isRainbowMode;
        if (isRainbowMode) {
            lastColor = ctx.strokeStyle;
            rainbowBtn.classList.add('active');
            canvas.classList.add('rainbow-active');
            // Disable eraser when rainbow mode is active
            isErasing = false;
            eraserBtn.classList.remove('active');
            canvas.classList.remove('eraser-active');
        } else {
            ctx.strokeStyle = colorPicker.value; // Reset to current color picker value
            rainbowBtn.classList.remove('active');
            canvas.classList.remove('rainbow-active');
        }
    }

    function startDrawing(e) {
        isDrawing = true;
        const pos = getMousePos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const pos = getMousePos(e);
        drawSymmetric(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Update brush size display and stroke width
    function updateBrushSize() {
        const size = brushSize.value;
        brushSizeValue.textContent = size + 'px';
        ctx.lineWidth = size;
    }

    // Update stroke color
    function updateColor() {
        if (!isErasing && !isRainbowMode) {
            ctx.strokeStyle = colorPicker.value;
            lastColor = colorPicker.value;
        }
    }

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    brushSize.addEventListener('input', updateBrushSize);
    colorPicker.addEventListener('input', updateColor);
    clearBtn.addEventListener('click', clearCanvas);
    saveBtn.addEventListener('click', saveDrawing);
    eraserBtn.addEventListener('click', toggleEraser);
    rainbowBtn.addEventListener('click', toggleRainbow);

    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="symmetry"]').forEach(radio => {
        radio.addEventListener('click', function(e) {
            // If clicking the already selected radio button, uncheck it
            if (this.value === activeSymmetry) {
                e.preventDefault();
                this.checked = false;
                document.getElementById('noSymmetry').checked = true;
                activeSymmetry = 'none';
            } else {
                activeSymmetry = this.value;
            }
        });
    });

    // Initialize brush size display and canvas
    updateBrushSize();
    clearCanvas();
});