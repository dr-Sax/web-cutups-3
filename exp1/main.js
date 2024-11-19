let slider = document.querySelector("input[type=range]");
slider.addEventListener("input", updateVal);

function updateVal() {
    document.querySelector("#pbrate").textContent = Math.floor(slider.value, 2) + "%";
    document.querySelector("audio").playbackRate = slider.value / 100;
}
