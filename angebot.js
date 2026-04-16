/* Angebot - Puzzle Hover-Logik */

const puzzleWraps = document.querySelectorAll('.puzzle-bild-wrap');
const infoDivs = document.querySelectorAll('.puzzle-info');
const infoDefault = document.getElementById('infoDefault');

puzzleWraps.forEach(wrap => {
    wrap.addEventListener('mouseenter', () => {
        const infoId = wrap.getAttribute('data-info');
        infoDivs.forEach(div => div.classList.remove('active'));
        document.getElementById(infoId).classList.add('active');
    });

    wrap.addEventListener('mouseleave', () => {
        infoDivs.forEach(div => div.classList.remove('active'));
        infoDefault.classList.add('active');
    });
});
