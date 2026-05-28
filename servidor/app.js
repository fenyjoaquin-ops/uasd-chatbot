const express = require("express");
const cors = require("cors");
require("dotenv").config();

const leerPDF = require("./utils/pdfReader");

const app = express();

app.use(cors({
    origin: "*"
}));
app.use(express.json());

let contenidoPDF = "";

// carga de pdf
const cargarPDF = async () => {
    contenidoPDF = await leerPDF();
    console.log("el pdf esta listo");
};

cargarPDF();

// busqueda en el pdf
const buscarEnPDF = (texto, pregunta) => {

    const palabras = pregunta
        .toLowerCase()
        .split(" ")
        .filter(p => p.length > 3);

    const bloques = texto.split("\n\n");

    const encontrados = bloques.filter(bloque => {
        const lower = bloque.toLowerCase();
        return palabras.some(p => lower.includes(p));
    });

    if (encontrados.length > 0) {
        return encontrados.slice(0, 6).join("\n\n");
    }

    return texto.slice(0, 4000);
};

// ruta principal
app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});

// chatbot 
app.post("/chat", async (req, res) => {

    try {

        const pregunta = req.body.pregunta;

        if (!pregunta) {
            return res.json({
                respuesta: "No se recibió ninguna pregunta."
            });
        }

        const contexto = buscarEnPDF(contenidoPDF, pregunta);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: `
Eres un asistente académico especializado en el Estatuto Orgánico de la UASD.

REGLAS OBLIGATORIAS:
- Responde SOLO con información del contexto proporcionado.
- No inventes información.
- Si no hay información, responde: "No encontré esa información en el Estatuto."
- Responde de forma clara y breve.
- Usa "Según el Estatuto..." cuando sea posible.
- Resume la información, no copies textos largos.
                        `
                    },
                    {
                        role: "user",
                        content: `
CONTEXTO DEL ESTATUTO:
${contexto}

PREGUNTA:
${pregunta}
                        `
                    }
                ]
            })
        });

        const data = await response.json();

        const respuesta =
            data?.choices?.[0]?.message?.content ||
            data?.error?.message ||
            "Sin respuesta del modelo";

        return res.json({ respuesta });

    } catch (error) {

        console.log("ERROR:", error);

        return res.json({
            respuesta: "Error en el servidor"
        });
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});