/* Angebot - Puzzle Hover-Logik mit Transparenz-Erkennung */

const puzzleWraps = document.querySelectorAll('.puzzle-bild-wrap');
const infoDivs = document.querySelectorAll('.puzzle-info');
const infoDefault = document.getElementById('infoDefault');

// Offscreen-Canvas pro Bild für Pixel-Alpha-Prüfung
const canvasMap = new Map();

function loadImageToCanvas(img) {
    return new Promise(resolve => {
        if (img.complete) {
            createCanvas(img);
            resolve();
        } else {
            img.addEventListener('load', () => {
                createCanvas(img);
                resolve();
            });
        }
    });
}

function createCanvas(img) {
    var c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    canvasMap.set(img, { canvas: c, ctx: ctx });
}

function isPixelVisible(img, mouseX, mouseY) {
    var data = canvasMap.get(img);
    if (!data) return true;

    var rect = img.getBoundingClientRect();
    var scaleX = img.naturalWidth / rect.width;
    var scaleY = img.naturalHeight / rect.height;
    var px = Math.floor((mouseX - rect.left) * scaleX);
    var py = Math.floor((mouseY - rect.top) * scaleY);

    if (px < 0 || py < 0 || px >= img.naturalWidth || py >= img.naturalHeight) return false;

    var pixel = data.ctx.getImageData(px, py, 1, 1).data;
    return pixel[3] > 30; // Alpha > 30 = sichtbar
}

// Alle Bilder in Canvas laden
var loadPromises = [];
puzzleWraps.forEach(function (wrap) {
    var img = wrap.querySelector('img');
    if (img) loadPromises.push(loadImageToCanvas(img));
});

Promise.all(loadPromises).then(function () {
    // Pointer-Events auf den Bildern deaktivieren, wir prüfen selbst
    puzzleWraps.forEach(function (wrap) {
        wrap.style.pointerEvents = 'none';
    });

    // Links auch deaktivieren
    document.querySelectorAll('.puzzle-teil a').forEach(function (a) {
        a.style.pointerEvents = 'none';
    });

    var activeWrap = null;

    document.querySelector('.puzzle-kreis').addEventListener('mousemove', function (e) {
        var found = null;

        // Alle Puzzle-Teile durchgehen (von vorne nach hinten im DOM)
        var teile = document.querySelectorAll('.puzzle-teil');
        for (var i = teile.length - 1; i >= 0; i--) {
            var wrap = teile[i].querySelector('.puzzle-bild-wrap');
            var img = wrap ? wrap.querySelector('img') : null;
            if (!img) continue;

            var rect = img.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                if (isPixelVisible(img, e.clientX, e.clientY)) {
                    found = wrap;
                    break;
                }
            }
        }

        if (found !== activeWrap) {
            // Alten Hover entfernen
            if (activeWrap) {
                activeWrap.classList.remove('pixel-hover');
            }

            activeWrap = found;

            if (activeWrap) {
                activeWrap.classList.add('pixel-hover');
                var infoId = activeWrap.getAttribute('data-info');
                infoDivs.forEach(function (div) { div.classList.remove('active'); });
                document.getElementById(infoId).classList.add('active');
            } else {
                infoDivs.forEach(function (div) { div.classList.remove('active'); });
                infoDefault.classList.add('active');
            }
        }
    });

    // Klick weiterleiten
    document.querySelector('.puzzle-kreis').addEventListener('click', function (e) {
        if (activeWrap) {
            var link = activeWrap.closest('a');
            if (link && link.href && link.getAttribute('href') !== '#') {
                window.location.href = link.href;
            }
        }
    });

    // Hover entfernen wenn Maus den Bereich verlässt
    document.querySelector('.puzzle-kreis').addEventListener('mouseleave', function () {
        if (activeWrap) {
            activeWrap.classList.remove('pixel-hover');
            activeWrap = null;
        }
        infoDivs.forEach(function (div) { div.classList.remove('active'); });
        infoDefault.classList.add('active');
    });

    // Cursor ändern
    document.querySelector('.puzzle-kreis').addEventListener('mousemove', function (e) {
        this.style.cursor = activeWrap ? 'pointer' : 'default';
    });
});
