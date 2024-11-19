//stuff goes here
let canvas = document.querySelector("canvas");
let context = canvas.getContext('2d');
context.rect(10, 10, 100, 100);
//context.fill();

let vid = document.querySelector("video");

context.globalAlpha = 0.05;

vid.addEventListener("timeupdate", function () {
    context.drawImage(vid, 0, 0);


});


vid.play(); 