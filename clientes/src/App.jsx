import { useState, useRef, useEffect } from "react";
import "./estilos/chat.css";

function App() {

  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  //  cargar historial
  useEffect(() => {
    const guardado = localStorage.getItem("chat");
    if (guardado) setChat(JSON.parse(guardado));
  }, []);

  //  guardar historial
  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(chat));
  }, [chat]);

  //  scroll automático
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  //  sugerencias
  const sugerencias = [
    "¿Qué es la UASD?",
    "¿Qué es el Claustro Mayor?",
    "¿Funciones del Rector?",
    "¿Qué es el Consejo Universitario?",
    "¿Derechos de los estudiantes?",
    "¿Funciones del Decano?"
  ];

  //  detectar saludo
  const esSaludo = (texto) => {
    const t = texto.toLowerCase();
    return (
      t.includes("hola") ||
      t.includes("buenas") ||
      t.includes("buenos días") ||
      t.includes("buenas tardes")
    );
  };

  //  enviar mensaje
  const enviarMensaje = async (textoParam) => {

    const textoFinal = textoParam || mensaje;

    if (!textoFinal.trim()) return;

    // respuesta automática saludo
    if (esSaludo(textoFinal)) {
      setChat(prev => [
        ...prev,
        { tipo: "usuario", texto: textoFinal },
        { tipo: "bot", texto: "¡Hola! 👋 Soy el asistente del Estatuto de la UASD. Puedes preguntarme sobre la universidad." }
      ]);
      setMensaje("");
      return;
    }

    setChat(prev => [
      ...prev,
      { tipo: "usuario", texto: textoFinal }
    ]);

    setMensaje("");
    setLoading(true);

    try {

      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pregunta: textoFinal
        })
      });

      const data = await res.json();

      setChat(prev => [
        ...prev,
        { tipo: "bot", texto: data.respuesta }
      ]);

    } catch (error) {
      setChat(prev => [
        ...prev,
        { tipo: "bot", texto: "Error de conexión con el servidor" }
      ]);
    }

    setLoading(false);
  };

  // Enter para enviar
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      enviarMensaje();
    }
  };

  return (
    <div className="layout">

      {/*  CHAT */}
      <div className="container">

        <div className="chatBox">

          {chat.map((m, i) => (
            <div
              key={i}
              className={m.tipo === "usuario" ? "msg user" : "msg bot"}
            >
              {m.texto}
            </div>
          ))}

          {loading && (
            <div className="msg bot typing">
              <span></span><span></span><span></span>
            </div>
          )}

          <div ref={chatRef}></div>

        </div>

        {/* INPUT */}
        <div className="inputBox">

          <input
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
          />

          <button onClick={() => enviarMensaje()}>
            Enviar
          </button>

        </div>

      </div>

      {/* SUGERENCIAS */}
      <div className="sugerencias">

        <h3>Preguntas sugeridas</h3>

        {sugerencias.map((s, i) => (
          <div
            key={i}
            className="sug"
            onClick={() => enviarMensaje(s)}
          >
            {s}
          </div>
        ))}

      </div>

    </div>
  );
}

export default App;