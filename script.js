let filterA = document.getElementById("blur");
let filterB = document.getElementById("contrast");
let filterC = document.getElementById("hue-rotate");
let filterD = document.getElementById("sepia");
let filterE = document.getElementById("brightness");
let filterF = document.getElementById("grayscale");

let noFlipBtn = document.getElementById("no-flip");
let flipXBtn = document.getElementById("flip-x");
let flipYBtn = document.getElementById("flip-y");

let uploadButton = document.getElementById("upload-button");
let image = document.getElementById("chosen-image");
let dropArea = document.getElementById("drop-area");
let history = [], redoStack = [];

function resetFilter() {
    filterA.value = "0";
    filterB.value = "100";
    filterC.value = "0";
    filterD.value = "0";
    filterE.value = "100";
    filterF.value = "0";
    noFlipBtn.checked = true;
    addFilter();
    flipImage();
}

function addFilter() {
    image.style.filter = `blur(${filterA.value}px) contrast(${filterB.value}%) hue-rotate(${filterC.value}deg) sepia(${filterD.value}%) brightness(${filterE.value}%) grayscale(${filterF.value}%)`;
}

function flipImage() {
    if (flipXBtn.checked) {
        image.style.transform = "scaleX(-1)";
    } else if (flipYBtn.checked) {
        image.style.transform = "scaleY(-1)";
    } else {
        image.style.transform = "scale(1,1)";
    }
}

function saveState() {
    if (image.src) {
        history.push({
            src: image.src,
            filter: image.style.filter,
            transform: image.style.transform
        });
        redoStack = [];
    }
}

function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        let state = history[history.length - 1];
        image.src = state.src;
        image.style.filter = state.filter;
        image.style.transform = state.transform;
    }
}

function redo() {
    if (redoStack.length > 0) {
        let state = redoStack.pop();
        image.src = state.src;
        image.style.filter = state.filter;
        image.style.transform = state.transform;
        history.push(state);
    }
}

uploadButton.onchange = () => {
    resetFilter();
    document.querySelector(".image-container").style.display = "block";
    let reader = new FileReader();
    reader.readAsDataURL(uploadButton.files[0]);

    reader.onload = () => {
        if (reader.result.startsWith("data:image")) {
            image.setAttribute("src", reader.result);
            saveState();
            addThumbnail(reader.result);
        } else {
            alert("Unsupported file type.");
        }
    };

    reader.onerror = () => {
        alert("Error reading file.");
    };
};

function addThumbnail(src) {
    const thumb = document.createElement("img");
    thumb.src = src;
    thumb.onclick = () => image.src = thumb.src;
    document.getElementById("preview-thumbnails").appendChild(thumb);
}

let sliders = document.querySelectorAll(".filter input[type='range']");
sliders.forEach(slider => {
    slider.addEventListener("input", () => {
        addFilter();
        saveState();
    });
});

let radioBtns = document.querySelectorAll(".flip-option input[type='radio']");
radioBtns.forEach(radioBtn => {
    radioBtn.addEventListener("click", () => {
        flipImage();
        saveState();
    });
});

document.getElementById("download-btn").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const tempImage = new Image();
    tempImage.src = image.src;

    tempImage.onload = () => {
        canvas.width = tempImage.width;
        canvas.height = tempImage.height;

        ctx.filter = image.style.filter;
        ctx.translate(canvas.width / 2, canvas.height / 2);

        if (flipXBtn.checked) ctx.scale(-1, 1);
        else if (flipYBtn.checked) ctx.scale(1, -1);

        ctx.drawImage(tempImage, -canvas.width / 2, -canvas.height / 2);
        const link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = canvas.toDataURL();
        link.click();
    };
});

["dragover", "dragenter"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
        e.preventDefault();
        dropArea.style.borderColor = "#28a745";
    })
);

["dragleave", "drop"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
        e.preventDefault();
        dropArea.style.borderColor = "#025bee";
    })
);

dropArea.addEventListener("drop", e => {
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        image.src = reader.result;
        document.querySelector(".image-container").style.display = "block";
        saveState();
        addThumbnail(reader.result);
    };
});
