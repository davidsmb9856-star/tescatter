const SHEET_ID = '1z5FYVvB0E9BeE3cRbl4id1YWi6lRB_2qzMhIvgz4Xx0';
const FOLDER_NAMES = ["DEPOSIT", "WITHDRAW", "GANGGUAN", "KENDALA ALL", "FOTO", "CARA BERMAIN", "PROMO"];

function doGet() {
return HtmlService.createHtmlOutputFromFile('index')
.setTitle('Aplikasi Catatan');
}

function doPost(e) {
try {
if (e.parameter.action === "getPasaran") {
const tanggal = getTanggalPasaran();
return ContentService.createTextOutput(
JSON.stringify({
tanggal: tanggal,
data: getPasaranList()
})
).setMimeType(ContentService.MimeType.JSON);
}

const data = JSON.parse(e.postData.contents);
const folder = data.folder;
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(folder);

if (!sheet) {
return jsonResponse({ status: 'error', message: 'Sheet tidak ditemukan' });
}

if (data.action === "delete") {
const result = deleteNote(folder, data.id);
return jsonResponse({ status: 'success', message: result });
}

const id = data.id || Utilities.getUuid();
const now = new Date();
const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

const title = data.title || '';
const content = data.content || '';
const content2 = data.content2 || '';
const content3 = data.content3 || '';

let updated = false;
const values = sheet.getDataRange().getValues();

for (let i = 1; i < values.length; i++) {
if (values[i][0] === id) {
sheet.getRange(i + 1, 2, 1, 5).setValues([[formattedDate, title, content, content2, content3]]);
updated = true;
break;
}
}

if (!updated) {
if (folder === "FOTO") {
sheet.appendRow([id, formattedDate, title, content, '', '']);
} else {
sheet.appendRow([id, formattedDate, title, content, content2, content3]);
}
}

return jsonResponse({
status: 'success',
id: id,
message: updated ? "Catatan diperbarui." : "Catatan disimpan."
});

} catch (error) {
return jsonResponse({
status: 'error',
message: 'Terjadi kesalahan: ' + error.message
});
}
}

function deleteNote(folder, id) {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(folder);
if (!sheet) return 'Sheet tidak ditemukan';
const values = sheet.getDataRange().getValues();
for (let i = 1; i < values.length; i++) {
if (values[i][0] === id) {
sheet.deleteRow(i + 1);
return 'Catatan dihapus';
}
}
return 'Catatan tidak ditemukan';
}

function getNotes(folder) {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(folder);
if (!sheet) return [];

const data = sheet.getDataRange().getValues();

return data.slice(1).map(row => ({
id: row[0],
date: Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"),
title: row[2],
content: row[3],
content2: row[4] || "",
content3: row[5] || ""
}));
}

function getHitunganTogel() {
const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("HITUNGAN TOGEL");
if (!sheet) {
return { error: "Sheet HITUNGAN TOGEL tidak ditemukan." };
}

const nominal = sheet.getRange("X1").getValue();

function gabungXY(xRange, yRange) {
const xData = sheet.getRange(xRange).getValues();
const yData = sheet.getRange(yRange).getValues();
return xData.map((x, i) => ({
label: x[0] || "",
value: yData[i] ? yData[i][0] || "" : ""
})).filter(row => row.label !== "" || row.value !== "");
}

const kelompok = {
"HITUNG HADIAH SEMUA PASARAN": gabungXY("X3:X43", "Y3:Y43"),
"HITUNG HADIAH PASARAN TOTO MACAU 4D": gabungXY("X46:X81", "Y46:Y81"),
"HITUNG HADIAH PASARAN TOTO MACAU 5D": gabungXY("X84:X120", "Y84:Y120"),
"HITUNG HADIAH PASARAN KINGKONG 4D": gabungXY("X123:X154", "Y123:Y154"),
"PERHITUNGAN BONUS": gabungXY("X157:X180", "Y157:Y180"),
"HITUNG HADIAH PASARAN JAKARTA": gabungXY("X183:X214", "Y183:Y214"),
"HITUNG HADIAH PASARAN TOTOMALI": gabungXY("X218:X249", "Y218:Y249"),
"HITUNG HADIAH PASARAN HOKIDRAW": gabungXY("X252:X283", "Y252:Y283"),
"HITUNG HADIAH PASARAN SYDNEY DAN HONGKONG": gabungXY("X286:X317", "Y286:Y317")
};

return {
nominal: nominal,
kelompok: kelompok
};
}

function updateNominalTogel(nominal) {
const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("HITUNGAN TOGEL");
sheet.getRange("X1").setValue(nominal);
}

function simpanFotoDariLink(judul, link) {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FOTO");
sheet.appendRow([new Date(), judul, link]);
}

function jsonResponse(obj) {
return ContentService
.createTextOutput(JSON.stringify(obj))
.setMimeType(ContentService.MimeType.JSON);
}

function getPasaranList() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PASARAN TOGEL");
if (!sheet) return [];

const dataB = sheet.getRange("B3:B86").getValues();
const dataC = sheet.getRange("C3:C86").getValues();

const result = [];
for (let i = 0; i < dataB.length; i++) {
const bVal = dataB[i][0] || "";
const cVal = dataC[i][0] || "";
result.push([bVal, cVal]);
}

return result;
}

function setTanggalPasaran(tanggal) {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PASARAN TOGEL");
if (!sheet) return;
sheet.getRange("B1").setValue(tanggal);
return "Tanggal pasaran disimpan: " + tanggal;
}

function getTanggalPasaran() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PASARAN TOGEL");
if (!sheet) return "";
const cellValue = sheet.getRange("B1").getValue();
if (!cellValue) return "";
if (cellValue instanceof Date) {
const day = cellValue.getDate().toString().padStart(2, '0');
const month = (cellValue.getMonth() + 1).toString().padStart(2, '0');
const year = cellValue.getFullYear();
return `${day}/${month}/${year}`;
}
return cellValue.toString();
}

function getPengaturanTogelLengkap() {
const ss = SpreadsheetApp.openById(SHEET_ID);
const sheet = ss.getSheetByName("HITUNGAN TOGEL");
const sheetPasaran = ss.getSheetByName("PASARAN TOGEL");

if (!sheet) return { status: "error", message: "Sheet HITUNGAN TOGEL tidak ditemukan." };

const kelompok = [
{ judul: "HADIAH SEMUA PASARAN TOGEL", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 3, endRow: 43 },
{ judul: "PASARAN TOTO MACAU 4D", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 46, endRow: 81 },
{ judul: "PASARAN TOTO MACAU 5D", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 84, endRow: 120 },
{ judul: "PASARAN KINGKONG 4D", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 123, endRow: 154 },
{ judul: "PERHITUNGAN ALL BONUS", colNama: "I", colHadiah: "K", colDiskon: "O", startRow: 157, endRow: 180 },
{ judul: "PASARAN JAKARTA", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 183, endRow: 214 },
{ judul: "PASARAN TOTOMALI", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 218, endRow: 249 },
{ judul: "PASARAN HOKIDRAW", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 252, endRow: 283 },
{ judul: "PASARAN SYDNEY DAN HONGKONG", colNama: "I", colHadiah: "K", colDiskon: "L", startRow: 286, endRow: 317 },
];

const data = kelompok.map(k => {
const namaData = sheet.getRange(`${k.colNama}${k.startRow}:${k.colNama}${k.endRow}`).getValues().map(r => r[0] || "");
const hadiahData = sheet.getRange(`${k.colHadiah}${k.startRow}:${k.colHadiah}${k.endRow}`).getValues().map(r => r[0] || "");
const diskonData = sheet.getRange(`${k.colDiskon}${k.startRow}:${k.colDiskon}${k.endRow}`).getValues().map(r => r[0] || "");
const items = namaData.map((n, i) => ({
nama: n,
hadiah: hadiahData[i] || "",
diskon: diskonData[i] || ""
})).filter(item => item.nama);

return {
judul: k.judul,
items: items,
colNama: k.colNama,
colHadiah: k.colHadiah,
colDiskon: k.colDiskon,
startRow: k.startRow
};
});

const linkLive = sheetPasaran ? sheetPasaran.getRange("C57:C86").getValues().map(r => r[0] || "") : [];

let jadwalPasaran = [];
if (sheetPasaran) {
const ranges = ["I", "J", "K", "L", "N"];
const values = ranges.map(col => sheetPasaran.getRange(`${col}3:${col}58`).getValues().map(r => r[0] || ""));
for (let i = 0; i < values[0].length; i++) {
if (values[0][i] || values[1][i]) {
jadwalPasaran.push({
index: i,
jamTutup: values[0][i],
namaPasaran: values[1][i],
diskon: values[2][i],
jamResult: values[3][i],
link: values[4][i]
});
}
}
}

const kendalaAllData = getKendalaAll();

return { status: "success", data, linkLive, jadwalPasaran, kendalaAllData };
}

function updatePengaturanTogelBaris(payload) {
const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("HITUNGAN TOGEL");
if (!sheet) return { status: "error", message: "Sheet tidak ditemukan" };

try {
if (payload.nama !== undefined)
sheet.getRange(payload.rangeNama).setValue(payload.nama);
if (payload.hadiah !== undefined)
sheet.getRange(payload.rangeHadiah).setValue(payload.hadiah);
if (payload.diskon !== undefined) {
const val = payload.diskon.toString().trim();
const cell = sheet.getRange(payload.rangeDiskon);
if (val.includes("%")) {
cell.setValue(val).setNumberFormat("@STRING@");
} else {
const num = parseFloat(val);
cell.setValue(!isNaN(num) ? num : val).setNumberFormat("0.##");
}
}
return { status: "success", message: "Pengaturan tersimpan" };
} catch (err) {
return { status: "error", message: "Gagal simpan: " + err };
}
}

function updateLinkPasaran(payload) {
const sheetPasaran = SpreadsheetApp.openById(SHEET_ID).getSheetByName("PASARAN TOGEL");
if (!sheetPasaran) return { status: "error", message: "Sheet PASARAN TOGEL tidak ditemukan" };

try {
const startRow = 57, col = 3;
sheetPasaran.getRange(startRow + parseInt(payload.index, 10), col).setValue(payload.link);
return { status: "success", message: "Link Live Pasaran tersimpan" };
} catch (err) {
return { status: "error", message: "Gagal simpan: " + err };
}
}

function updateJadwalPasaran(payload) {
const sheetPasaran = SpreadsheetApp.openById(SHEET_ID).getSheetByName("PASARAN TOGEL");
if (!sheetPasaran) return { status: "error", message: "Sheet PASARAN TOGEL tidak ditemukan" };

try {
const rowStart = 3;
const colMap = { jamTutup: 9, namaPasaran: 10, diskon: 11, jamResult: 12, link: 14 };

const r = rowStart + parseInt(payload.index, 10);
sheetPasaran.getRange(r, colMap.jamTutup).setValue(payload.jamTutup);
sheetPasaran.getRange(r, colMap.namaPasaran).setValue(payload.namaPasaran);
sheetPasaran.getRange(r, colMap.diskon).setValue(payload.diskon);
sheetPasaran.getRange(r, colMap.jamResult).setValue(payload.jamResult);
sheetPasaran.getRange(r, colMap.link).setValue(payload.link);

return { status: "success", message: "Jadwal Pasaran tersimpan" };
} catch (err) {
return { status: "error", message: "Gagal simpan Jadwal Pasaran: " + err };
}
}

function getKendalaAll() {
const ss = SpreadsheetApp.openById(SHEET_ID);
const sh = ss.getSheetByName('KENDALA ALL');
if (!sh) return { status: "error", message: "Sheet KENDALA ALL tidak ditemukan." };

const lastRow = sh.getLastRow();
// Jika sheet kosong (hanya header row), kembalikan satu item kosong untuk ditampilkan.
if (lastRow < 2) {
return [{
rowIndex: 2,
judul: "",
jawaban1: "",
jawaban2: "",
jawaban3: ""
}];
}

// Dapatkan nilai dari kolom C sampai F, mulai dari baris 2 hingga baris terakhir dengan konten.
const data = sh.getRange(2, 3, lastRow - 1, 4).getValues();

// Petakan data ke format yang diinginkan, **termasuk baris kosong**.
const items = data.map((row, i) => ({
rowIndex: i + 2,
judul: row[0] || "",
jawaban1: row[1] || "",
jawaban2: row[2] || "",
jawaban3: row[3] || ""
}));
return items;
}

function updateKendalaAll(item) {
const ss = SpreadsheetApp.openById(SHEET_ID);
const sh = ss.getSheetByName('KENDALA ALL');
if (!sh) return { status: "error", message: "Sheet KENDALA ALL tidak ditemukan." };

try {
sh.getRange(item.rowIndex, 3).setValue(item.judul);
sh.getRange(item.rowIndex, 4).setValue(item.jawaban1);
sh.getRange(item.rowIndex, 5).setValue(item.jawaban2);
sh.getRange(item.rowIndex, 6).setValue(item.jawaban3);
return { status: "success", message: "Data Kendala ALL berhasil disimpan." };
} catch (err) {
return { status: "error", message: "Gagal simpan: " + err };
}
}

function tambahKendalaAllBaris() {
const ss = SpreadsheetApp.openById(SHEET_ID);
const sh = ss.getSheetByName('KENDALA ALL');
if (!sh) return { status: "error", message: "Sheet KENDALA ALL tidak ditemukan." };
try {
sh.appendRow(["", "", "", ""]);
return { status: "success", message: "Baris kosong berhasil ditambahkan." };
} catch(err) {
return { status: "error", message: "Gagal menambahkan baris: " + err.message };
}
}

function saveNewKendalaAll(payload) {
const ss = SpreadsheetApp.openById(SHEET_ID);
const sh = ss.getSheetByName('KENDALA ALL');
if (!sh) return { status: "error", message: "Sheet KENDALA ALL tidak ditemukan." };

try {
// Cari baris kosong pertama
const lastRow = sh.getLastRow();
const nextRow = lastRow + 1;

// Tulis data ke baris kosong tersebut
sh.getRange(nextRow, 3).setValue(payload.judul);
sh.getRange(nextRow, 4).setValue(payload.jawaban1);
sh.getRange(nextRow, 5).setValue(payload.jawaban2);
sh.getRange(nextRow, 6).setValue(payload.jawaban3);

return { status: "success", message: "Catatan baru berhasil disimpan." };
} catch(err) {
return { status: "error", message: "Gagal menyimpan catatan baru: " + err.message };
}
}

function addNewKendala(payload) {
const ss = SpreadsheetApp.openById(SHEET_ID);
const sh = ss.getSheetByName('KENDALA ALL');
if (!sh) {
return { status: "error", message: "Sheet KENDALA ALL tidak ditemukan." };
}
try {
const lastRow = sh.getLastRow();
const nextRow = lastRow + 1;
// Pastikan baris berikutnya adalah baris kosong
const range = sh.getRange(nextRow, 3, 1, 4);
// Tulis data ke baris kosong yang paling bawah
range.setValues([[payload.judul, payload.jawaban1, payload.jawaban2, payload.jawaban3]]);
return { status: "success", message: "Catatan baru berhasil ditambahkan." };
} catch (e) {
return { status: "error", message: "Gagal menambahkan catatan: " + e.message };
}
}

function getReportLineData() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName("PERIHAL REPORT");
    
    if (!sheet) {
        return { status: "error", message: "Sheet 'PERIHAL REPORT' tidak ditemukan." };
    }

    try {
        const dataRange = sheet.getRange("A2:D450");
        const values = dataRange.getValues();
        
        const items = values
            .map((row, i) => ({
                rowIndex: i + 2, 
                colA: row[0] ? String(row[0]).trim() : "", // ALL KENDALA REPORT
                colB: row[1] ? String(row[1]).trim() : "", // MEMO/REPORT
                colC: row[2] ? String(row[2]).trim() : "", // POST/MEMO KE ADMIN,WA,FB
                colD: row[3] ? String(row[3]).trim() : ""  // REPORT KE LINE
            }))
            .filter(item => {
                // Filter: Hanya sertakan baris jika SETIDAKNYA satu kolom (A, B, C, atau D) memiliki data.
                return item.colA || item.colB || item.colC || item.colD;
            });

        return { 
            status: "success", 
            data: items
        };

    } catch (e) {
        return { status: "error", message: "Gagal mengambil data report: " + e.message };
    }
}

/**
 * Memperbarui data ke Google Sheet.
 */
function updateReportLineData(payload) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName("PERIHAL REPORT");
    
    if (!sheet) {
        return { status: "error", message: "Sheet 'PERIHAL REPORT' tidak ditemukan." };
    }

    try {
        const row = payload.rowIndex;
        if (row < 2 || row > 450) {
            return { status: "error", message: "Indeks baris tidak valid." };
        }
        
        // Tulis nilai baru ke sel A, B, C, dan D pada baris tersebut.
        sheet.getRange(row, 1, 1, 4).setValues([[
            payload.colA, 
            payload.colB, 
            payload.colC, 
            payload.colD
        ]]);
        
        return { status: "success", message: `Baris ${row} berhasil diperbarui.` };

    } catch (e) {
        return { status: "error", message: "Gagal menyimpan data report: " + e.message };
    }
}

// Catatan: Pastikan jsonResponse(obj) juga ada di kode GAS Anda
function jsonResponse(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}
