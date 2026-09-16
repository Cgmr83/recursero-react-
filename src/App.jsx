import { useState } from 'react'
import './App.css'

const materiales = [
  {
    titulo: "Radiación ionizante: usos diagnósticos y terapéuticos",
    materia: "Radiación y Vida",
    anio: 5,
    contenido: "universo y radiación",
    tipo: "presentación",
    tipoIcono: "PRE",
    descripcion: "Presentación sobre la interacción de la radiación con los tejidos vivos y sus aplicaciones médicas.",
    autor: "Sofía Castro",
    avatar: "SC"
  },
  {
    titulo: "Guía teórica: vectores y magnitudes físicas",
    materia: "Matemática para la Física",
    anio: 5,
    contenido: "geometría",
    tipo: "texto",
    tipoIcono: "TXT",
    descripcion: "Desarrollo conceptual del tratamiento vectorial aplicado al movimiento y las fuerzas.",
    autor: "Juan Lima",
    avatar: "JL"
  },
  {
    titulo: "El registro fósil — guía de laboratorio",
    materia: "Historia de la Vida y de la Tierra",
    anio: 3,
    contenido: "evolución",
    tipo: "proyecto / laboratorio",
    tipoIcono: "LAB",
    descripcion: "Proyecto experimental para interpretar la datación relativa a partir de estratos simulados.",
    autor: "Pablo Díaz",
    avatar: "PD"
  },
  {
    titulo: "Planificación anual: dinámica de poblaciones",
    materia: "Ecología",
    anio: 4,
    contenido: "salud y ambiente",
    tipo: "planificación",
    tipoIcono: "PLA",
    descripcion: "Unidad completa con secuencia de clases, salida de campo y propuesta de evaluación.",
    autor: "Marina Rossi",
    avatar: "MR"
  },
  {
    titulo: "Simulador de circuitos eléctricos básicos",
    materia: "Física y Tecnología",
    anio: 5,
    contenido: "energía",
    tipo: "simulador",
    tipoIcono: "SIM",
    descripcion: "Herramienta interactiva para armar circuitos y visualizar corriente y voltaje.",
    autor: "Lucía Núñez",
    avatar: "LN"
  },
  {
    titulo: "Experimento: pH de alimentos de consumo diario",
    materia: "Química, Alimentación y Salud",
    anio: 4,
    contenido: "salud y ambiente",
    tipo: "experimento",
    tipoIcono: "EXP",
    descripcion: "Actividad grupal para medir y comparar la acidez de distintos alimentos con indicadores caseros.",
    autor: "Sofía Castro",
    avatar: "SC"
  },
  {
    titulo: "Experimento: fluidez de membrana",
    materia: "Biología",
    anio: 3,
    contenido: "biotecnología",
    tipo: "experimento",
    tipoIcono: "EXP",
    descripcion: "Actividad grupal.",
    autor: "Claudia Muñoz",
    avatar: "SC"
  }
]

const opcionesMateria = [
  "Física", "Fisicoquímica", "Biología", "Matemática", "Química",
  "Partículas, Energía y Cosmología", "Radiación y Vida", "Química, Alimentación y Salud",
  "Ecología", "Historia de la Vida y de la Tierra", "Filosofía de la Ciencia y la Tecnología",
  "Problemáticas Científicas con Impacto Social", "Lógica y Filosofía de la Ciencia",
  "Matemática para la Física", "Física y Tecnología", "Problemáticas de la Física Actual", "Laboratorio"
]

const opcionesContenido = [
  "Álgebra", "Biotecnología", "Derivada", "Energía", "Estadística y probabilidad",
  "Evolución", "Geometría", "Integral", "Límite", "Salud y ambiente", "Universo y radiación"
]

const opcionesTipo = [
  "Presentación", "Texto", "Planificación", "Proyecto / laboratorio", "Simulador", "Experimento"
]

function Tarjeta(props) {
  return (
    <div className="tarjeta">
      <div className="tarjeta-top">
        <span className="materia-tag">{props.materia}</span>
        <div className="tipo-icono">{props.tipoIcono}</div>
      </div>
      <h3>{props.titulo}</h3>
      <p className="desc">{props.descripcion}</p>
      <div className="tarjeta-meta">
        <div className="autor">
          <div className="avatar">{props.avatar}</div>
          <span>{props.autor}</span>
        </div>
        <span className="nivel">{props.anio}.º año</span>
      </div>
    </div>
  )
}

// Componente reutilizable: un grupo de checkboxes que agregan/sacan valores de una lista de estado.
function GrupoCheckbox(props) {
  function estaElegido(valor) {
    return props.elegidos.includes(valor)
  }

  function toggle(valor) {
    if (estaElegido(valor)) {
      props.setElegidos(props.elegidos.filter(function (v) { return v !== valor }))
    } else {
      props.setElegidos([...props.elegidos, valor])
    }
  }

  return (
    <div className="filtro-grupo">
      <h3>{props.titulo}</h3>
      <div className={props.scroll ? 'lista-scroll' : ''}>
        {props.opciones.map(function (opcion) {
          return (
            <label key={opcion}>
              <input
                type="checkbox"
                checked={estaElegido(opcion.toLowerCase())}
                onChange={function () { toggle(opcion.toLowerCase()) }}
              />
              {opcion}
            </label>
          )
        })}
      </div>
    </div>
  )
}

function App() {
  const [busqueda, setBusqueda] = useState('')
  const [aniosElegidos, setAniosElegidos] = useState([])
  const [materiasElegidas, setMateriasElegidas] = useState([])
  const [contenidosElegidos, setContenidosElegidos] = useState([])
  const [tiposElegidos, setTiposElegidos] = useState([])

  function toggleAnio(anio) {
    if (aniosElegidos.includes(anio)) {
      setAniosElegidos(aniosElegidos.filter(function (a) { return a !== anio }))
    } else {
      setAniosElegidos([...aniosElegidos, anio])
    }
  }

  const filtrados = materiales.filter(function (m) {
    const texto = busqueda.toLowerCase()
    const coincideTexto =
      m.titulo.toLowerCase().includes(texto) ||
      m.materia.toLowerCase().includes(texto)

    const coincideAnio = aniosElegidos.length === 0 || aniosElegidos.includes(m.anio)
    const coincideMateria = materiasElegidas.length === 0 || materiasElegidas.includes(m.materia.toLowerCase())
    const coincideContenido = contenidosElegidos.length === 0 || contenidosElegidos.includes(m.contenido.toLowerCase())
    const coincideTipo = tiposElegidos.length === 0 || tiposElegidos.includes(m.tipo.toLowerCase())

    return coincideTexto && coincideAnio && coincideMateria && coincideContenido && coincideTipo
  })

  return (
    <>
      <header>
        <div className="brand">
          <h1>Recursero de Exactas y Naturales</h1>
        </div>
        <div className="right">
          <div className="searchbar">
            <input
              type="text"
              placeholder="Buscar por título, materia o autor…"
              value={busqueda}
              onChange={function (e) { setBusqueda(e.target.value) }}
            />
          </div>
          <a className="donar-btn" href="https://cafecito.app/recursero1" target="_blank" rel="noopener">☕ Invitame un cafecito</a>
          <a className="subir-btn" href="#">Subir material</a>
        </div>
      </header>

      <div className="layout">
        <aside>
          <GrupoCheckbox
            titulo="Materia"
            opciones={opcionesMateria}
            elegidos={materiasElegidas}
            setElegidos={setMateriasElegidas}
            scroll={true}
          />

          <div className="filtro-grupo">
            <h3>Año</h3>
            {[1, 2, 3, 4, 5, 6].map(function (anio) {
              return (
                <label key={anio}>
                  <input
                    type="checkbox"
                    checked={aniosElegidos.includes(anio)}
                    onChange={function () { toggleAnio(anio) }}
                  />
                  {anio}.º año
                </label>
              )
            })}
          </div>

          <GrupoCheckbox
            titulo="Contenido"
            opciones={opcionesContenido}
            elegidos={contenidosElegidos}
            setElegidos={setContenidosElegidos}
            scroll={true}
          />

          <GrupoCheckbox
            titulo="Tipo de archivo"
            opciones={opcionesTipo}
            elegidos={tiposElegidos}
            setElegidos={setTiposElegidos}
            scroll={false}
          />
        </aside>

        <main>
          <div className="main-top">
            <div>
              <h2>Materiales</h2>
              <p>Ciencias Naturales y Matemática — nivel secundario.</p>
            </div>
            <div className="conteo">{filtrados.length} materiales</div>
          </div>
          <div className="grid">
            {filtrados.length === 0 ? (
              <div className="sin-resultados">
                <div className="icono">🔎</div>
                <p><strong>No encontramos materiales</strong> con esos filtros.</p>
                <p>Probá sacar alguno de los filtros tildados o cambiar la búsqueda.</p>
              </div>
            ) : (
              filtrados.map(function (m) {
                return (
                  <Tarjeta
                    key={m.titulo}
                    titulo={m.titulo}
                    materia={m.materia}
                    anio={m.anio}
                    tipoIcono={m.tipoIcono}
                    descripcion={m.descripcion}
                    autor={m.autor}
                    avatar={m.avatar}
                  />
                )
              })
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default App