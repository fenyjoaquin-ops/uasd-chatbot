const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const leerPDF = async () => {

    const rutaPDF = path.join(__dirname, "../data/estatuto.pdf");

    const dataBuffer = fs.readFileSync(rutaPDF);

    const data = await pdfParse(dataBuffer);

    return data.text;
};

module.exports = leerPDF;