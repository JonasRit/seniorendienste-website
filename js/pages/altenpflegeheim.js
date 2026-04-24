// Kurzzeitpflege-Rechner

document.addEventListener('DOMContentLoaded', function () {
    var jaBtn = document.getElementById('ja_button');
    var neinBtn = document.getElementById('nein_button');
    var restbetrag = document.getElementById('kzp-restbetrag');

    // Datepicker bei Klick auf gesamtes Feld öffnen
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
        input.addEventListener('click', function () {
            this.showPicker();
        });
    });

    if (!jaBtn || !neinBtn) return;

    jaBtn.addEventListener('click', function () {
        restbetrag.style.display = 'block';
        jaBtn.classList.add('active');
        neinBtn.classList.remove('active');
    });

    neinBtn.addEventListener('click', function () {
        restbetrag.style.display = 'none';
        neinBtn.classList.add('active');
        jaBtn.classList.remove('active');
        document.getElementById('pflegekasse_kzp-anspruch').value = '';
        document.getElementById('pflegekasse_verhinderungspf').value = '';
    });
});

function zeigeAusgewaehlteDaten() {
    // Konfigurierbare Werte
    var fehler = [];
    var kzp_anspruch_max = 1774;
    var verhinderungspflege_anspruch_max = 1612;
    var unterkunft = 20.90;
    var verpflegung = 18.23;
    var investitionskosten = 11.25;
    var ausbildungs_Zuschlag = 5.10;

    var pflegesatz = {
        2: 99.48,
        3: 118.22,
        4: 137.77,
        5: 146.53
    };

    // Fehlermeldungen zurücksetzen
    document.getElementById('kzp-fehler-datum').innerHTML = '';
    document.getElementById('kzp-fehler-kzp').innerHTML = '';
    document.getElementById('kzp-fehler-verh').innerHTML = '';

    // Datum auslesen
    var startDatum_lang = new Date(document.getElementById('start-date').value);
    var endDatum_lang = new Date(document.getElementById('end-date').value);
    var startDatum = startDatum_lang.toLocaleDateString();
    var endDatum = endDatum_lang.toLocaleDateString();

    // Tage berechnen
    var tage = (Math.ceil((endDatum_lang - startDatum_lang) / (1000 * 3600 * 24))) + 1;

    // Datum validieren
    if (startDatum === 'Invalid Date' || endDatum === 'Invalid Date') {
        document.getElementById('kzp-fehler-datum').innerHTML = 'Bitte wählen Sie ein Start- und Enddatum aus.';
        fehler.push('fehlerDatum');
    } else if (tage < 1) {
        document.getElementById('kzp-fehler-datum').innerHTML = 'Bitte überprüfen Sie den Zeitraum.';
        fehler.push('fehlerTage');
    }

    // Pflegegrad
    var pflegegrad = parseInt(document.getElementById('pflegegrad').value);

    // Restbeträge auslesen
    var kzp_anspruch = parseFloat(document.getElementById('pflegekasse_kzp-anspruch').value);
    var verhinderungspflege_anspruch = parseFloat(document.getElementById('pflegekasse_verhinderungspf').value);

    if (isNaN(kzp_anspruch)) kzp_anspruch = kzp_anspruch_max;
    if (isNaN(verhinderungspflege_anspruch)) verhinderungspflege_anspruch = verhinderungspflege_anspruch_max;

    // Restbeträge validieren
    if (kzp_anspruch < 0) {
        document.getElementById('kzp-fehler-kzp').innerHTML = 'Kurzzeitpflege-Anspruch darf nicht kleiner als 0 sein.';
        fehler.push('fehlerKZP');
    } else if (kzp_anspruch > kzp_anspruch_max) {
        document.getElementById('kzp-fehler-kzp').innerHTML = 'Kurzzeitpflege-Anspruch max: ' + kzp_anspruch_max + ' €';
        fehler.push('fehlerKZP');
    }

    if (verhinderungspflege_anspruch < 0) {
        document.getElementById('kzp-fehler-verh').innerHTML = 'Verhinderungspflege-Anspruch darf nicht kleiner als 0 sein.';
        fehler.push('fehlerVerh');
    } else if (verhinderungspflege_anspruch > verhinderungspflege_anspruch_max) {
        document.getElementById('kzp-fehler-verh').innerHTML = 'Verhinderungspflege-Anspruch max: ' + verhinderungspflege_anspruch_max + ' €';
        fehler.push('fehlerVerh');
    }

    // Berechnung
    var pflegeBetrag_anspruch = kzp_anspruch + verhinderungspflege_anspruch;
    var pflegesatz_aktuell = pflegesatz[pflegegrad];
    var pflegesumme = pflegesatz_aktuell + ausbildungs_Zuschlag;
    var pflegesumme_gesamt = pflegesumme * tage;
    var unterkunft_gesamt = unterkunft * tage;
    var verpflegung_gesamt = verpflegung * tage;
    var investitionskosten_gesamt = investitionskosten * tage;
    var entgelt_gesamt = pflegesumme_gesamt + unterkunft_gesamt + verpflegung_gesamt + investitionskosten_gesamt;

    // Pflegekasse übernimmt
    var pflege_zahlt, eigenPflegeanteil, zusatz_tage = 0;
    var pflekassewert = pflegeBetrag_anspruch - pflegesumme_gesamt;

    if (pflekassewert < 0) {
        pflege_zahlt = pflegeBetrag_anspruch;
        eigenPflegeanteil = pflegesumme_gesamt - pflege_zahlt;
    } else {
        pflege_zahlt = pflegesumme_gesamt;
        zusatz_tage = pflekassewert / pflegesumme;
        eigenPflegeanteil = 0;
    }

    var eigen_Betrag = entgelt_gesamt - pflege_zahlt;

    // Ergebnis anzeigen
    var ergebnisDiv = document.getElementById('kzp-ergebnis');
    var table = document.getElementById('idTabelle_kurzRechner');

    if (fehler.length === 0) {
        ergebnisDiv.style.display = 'block';

        function euro(val) {
            return (Math.round(val * 100) / 100).toFixed(2) + ' €';
        }

        function setCell(row, col, text) {
            table.rows[row].cells[col].innerText = text;
        }

        // Pflege
        setCell(1, 1, tage + ' Tage');
        setCell(1, 2, euro(pflegesumme));
        setCell(1, 3, euro(pflegesumme_gesamt));
        setCell(1, 4, euro(pflege_zahlt));
        setCell(1, 5, euro(eigenPflegeanteil));

        // Unterkunft + Verpflegung
        setCell(3, 1, tage + ' Tage');
        setCell(3, 2, euro(unterkunft + verpflegung));
        setCell(3, 3, euro(unterkunft_gesamt + verpflegung_gesamt));
        setCell(3, 4, '–');
        setCell(3, 5, euro(unterkunft_gesamt + verpflegung_gesamt));

        // Investitionskosten
        setCell(4, 1, tage + ' Tage');
        setCell(4, 2, euro(investitionskosten));
        setCell(4, 3, euro(investitionskosten_gesamt));
        setCell(4, 4, '–');
        setCell(4, 5, euro(investitionskosten_gesamt));

        // Summe
        setCell(5, 1, '');
        setCell(5, 2, euro(pflegesumme + unterkunft + verpflegung + investitionskosten));
        setCell(5, 3, euro(entgelt_gesamt));
        setCell(5, 4, euro(pflege_zahlt));
        setCell(5, 5, euro(eigen_Betrag));

        // Mobile Karten generieren
        var mobilCards = document.getElementById('kzp-mobil-cards');
        mobilCards.innerHTML = ''
            + buildCard('Pflege', tage, euro(pflegesumme), euro(pflegesumme_gesamt), euro(pflege_zahlt), euro(eigenPflegeanteil))
            + buildCard('Unterkunft + Verpflegung', tage, euro(unterkunft + verpflegung), euro(unterkunft_gesamt + verpflegung_gesamt), '–', euro(unterkunft_gesamt + verpflegung_gesamt))
            + buildCard('Investitionskosten', tage, euro(investitionskosten), euro(investitionskosten_gesamt), '–', euro(investitionskosten_gesamt))
            + buildCard('Summe', '', euro(pflegesumme + unterkunft + verpflegung + investitionskosten), euro(entgelt_gesamt), euro(pflege_zahlt), euro(eigen_Betrag), true);

        // Zusatztage
        var zusatzDiv = document.getElementById('kzp-zusatztage');
        if (Math.floor(zusatz_tage) > 0) {
            zusatzDiv.innerHTML = 'Zusätzlich stehen noch <strong>' + Math.floor(zusatz_tage) + '</strong> Tage zur Verfügung.';
        } else {
            zusatzDiv.innerHTML = '';
        }
    } else {
        ergebnisDiv.style.display = 'none';
    }
}

function buildCard(titel, tage, tagessatz, entgelt, kasse, eigen, isSumme) {
    var cls = isSumme ? 'kzp-mobil-card kzp-mobil-summe' : 'kzp-mobil-card';
    var html = '<div class="' + cls + '">';
    html += '<h4>' + titel + '</h4>';
    if (tage) html += '<div class="kzp-mobil-row"><span>Tage</span><span>' + tage + '</span></div>';
    html += '<div class="kzp-mobil-row"><span>Entgelt/Tag</span><span>' + tagessatz + '</span></div>';
    html += '<div class="kzp-mobil-row"><span>Entgelt</span><span>' + entgelt + '</span></div>';
    html += '<div class="kzp-mobil-row"><span>Pflegekasse</span><span>' + kasse + '</span></div>';
    html += '<div class="kzp-mobil-row"><span>Eigenanteil</span><span>' + eigen + '</span></div>';
    html += '</div>';
    return html;
}
