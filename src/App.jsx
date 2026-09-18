import { useState, useRef, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

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

const iconosPorTipo = {
  'presentación': 'PRE',
  'texto': 'TXT',
  'planificación': 'PLA',
  'proyecto / laboratorio': 'LAB',
  'simulador': 'SIM',
  'experimento': 'EXP'
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .map(function (palabra) { return palabra[0] })
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function Tarjeta(props) {
  return (
    <div className="tarjeta">
      <div className="tarjeta-top">
        <span className="materia-tag">{props.materia}</span>
        <div className="tipo-icono">{iconosPorTipo[props.tipo.toLowerCase()] || '?'}</div>
      </div>
      <h3>{props.titulo}</h3>
      <p className="desc">{props.descripcion}</p>
      <div className="tarjeta-meta">
        <div className="autor">
          <div className="avatar">{iniciales(props.autor)}</div>
          <span>{props.autor}</span>
        </div>
        <span className="nivel">{props.anio}.º año</span>
      </div>
    </div>
  )
}

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

function FiltroContenidoAlfabetico(props) {
  const refsPorLetra = useRef({})

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

  const grupos = {}
  props.opciones.forEach(function (opcion) {
    const letra = opcion[0].toUpperCase()
    if (!grupos[letra]) grupos[letra] = []
    grupos[letra].push(opcion)
  })
  const letras = Object.keys(grupos).sort()

  function irALetra(letra) {
    const el = refsPorLetra.current[letra]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="filtro-grupo">
      <h3>Contenido</h3>
      <div className="indice-alfabetico">
        {letras.map(function (letra) {
          return (
            <button type="button" key={letra} onClick={function () { irALetra(letra) }}>
              {letra}
            </button>
          )
        })}
      </div>
      <div className="lista-scroll">
        {letras.map(function (letra) {
          return (
            <div className="letra-grupo" key={letra}>
              <span
                className="letra-header"
                ref={function (el) { refsPorLetra.current[letra] = el }}
              >
                {letra}
              </span>
              {grupos[letra].map(function (opcion) {
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
          )
        })}
      </div>
    </div>
  )
}

// Combo con chips: buscar en una lista de opciones, o agregar un valor nuevo como "pendiente".
function ComboEtiquetas(props) {
  const [elegidos, setElegidos] = useState([])
  const [texto, setTexto] = useState('')

  function reportar(lista) {
    setElegidos(lista)
    if (props.onChange) props.onChange(lista)
  }

  function agregar(valor) {
    const esNueva = !props.opciones.some(function (o) {
      return o.toLowerCase() === valor.toLowerCase()
    })
    const nuevoChip = { valor: valor, esNueva: esNueva }

    if (props.unico) {
      reportar([nuevoChip])
    } else {
      reportar([...elegidos, nuevoChip])
    }
    setTexto('')
  }

  function quitar(valor) {
    reportar(elegidos.filter(function (e) { return e.valor !== valor }))
  }

  const yaElegidos = elegidos.map(function (e) { return e.valor.toLowerCase() })
  const textoLimpio = texto.trim()
  const coincidencias = textoLimpio === '' ? [] : props.opciones.filter(function (o) {
    return !yaElegidos.includes(o.toLowerCase()) && o.toLowerCase().includes(textoLimpio.toLowerCase())
  })
  const existeExacto = props.opciones.some(function (o) {
    return o.toLowerCase() === textoLimpio.toLowerCase()
  })

  return (
    <div className="campo combo">
      <label>{props.titulo}</label>
      <div className="chips">
        {elegidos.map(function (e) {
          return (
            <span key={e.valor} className={'chip' + (e.esNueva ? ' nueva' : '')}>
              {e.valor} <button type="button" onClick={function () { quitar(e.valor) }}>×</button>
            </span>
          )
        })}
      </div>
      <input
        type="text"
        placeholder={props.placeholder}
        value={texto}
        onChange={function (e) { setTexto(e.target.value) }}
      />
      {textoLimpio !== '' && (
        <div className="combo-lista abierta">
          {coincidencias.slice(0, 8).map(function (op) {
            return (
              <div key={op} className="combo-opcion" onClick={function () { agregar(op) }}>
                {op}
              </div>
            )
          })}
          {!existeExacto && (
            <div className="combo-opcion-nueva" onClick={function () { agregar(textoLimpio) }}>
              + Agregar "{textoLimpio}" (queda pendiente de aprobación)
            </div>
          )}
        </div>
      )}
      <p className="ayuda">{props.ayuda}</p>
    </div>
  )
}

function FormularioSubida(props) {
  const [titulo, setTitulo] = useState('')
  const [anio, setAnio] = useState(4)
  const [materiaElegida, setMateriaElegida] = useState([])
  const [tipoElegido, setTipoElegido] = useState([])
  const [contenidoElegido, setContenidoElegido] = useState([])
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()

    if (titulo.trim() === '' || materiaElegida.length === 0 || tipoElegido.length === 0) {
      alert('Completá al menos el título, la materia y el tipo de archivo.')
      return
    }

    setEnviando(true)

    const nuevoMaterial = {
      titulo: titulo.trim(),
      materia: materiaElegida.map(function (m) { return m.valor }).join(', '),
      anio: anio,
      tipo: tipoElegido[0].valor,
      contenido: contenidoElegido.map(function (c) { return c.valor }).join(', '),
      descripcion: descripcion.trim(),
      autor: 'Anónimo'
    }

    const { error } = await supabase.from('materiales').insert(nuevoMaterial)

    setEnviando(false)

    if (error) {
      alert('Hubo un error al publicar: ' + error.message)
    } else {
      alert('¡Material publicado!')
      props.onPublicado()
    }
  }

  return (
    <div className="wrap">
      <a className="volver" href="#" onClick={function (e) { e.preventDefault(); props.onVolver() }}>
        ← Volver a Materiales
      </a>
      <h1>Subir material</h1>
      <p className="subtitulo">Completá los datos. Si una materia o contenido no está en la lista, podés agregarlo vos mismo/a.</p>

      <form onSubmit={enviar}>
        <div className="campo">
          <label>Título del material</label>
          <input
            type="text"
            placeholder="Ej: Guía de ejercicios sobre derivadas"
            value={titulo}
            onChange={function (e) { setTitulo(e.target.value) }}
          />
        </div>

        <ComboEtiquetas
          titulo="Materia"
          opciones={opcionesMateria}
          placeholder="Escribí para buscar o agregar una materia…"
          ayuda="Si escribís algo que no existe, se agrega como pendiente de aprobación."
          onChange={setMateriaElegida}
        />

        <div className="campo">
          <label>Año</label>
          <select value={anio} onChange={function (e) { setAnio(Number(e.target.value)) }}>
            <option value={1}>1.º año</option>
            <option value={2}>2.º año</option>
            <option value={3}>3.º año</option>
            <option value={4}>4.º año</option>
            <option value={5}>5.º año</option>
            <option value={6}>6.º año</option>
          </select>
        </div>

        <ComboEtiquetas
          titulo="Tipo de archivo"
          opciones={opcionesTipo}
          unico={true}
          placeholder="Escribí para buscar o agregar un tipo de archivo…"
          ayuda="Elegí uno solo. Si no está en la lista, se agrega como pendiente de aprobación."
          onChange={setTipoElegido}
        />

        <ComboEtiquetas
          titulo="Contenido"
          opciones={opcionesContenido}
          placeholder="Escribí para buscar o agregar un contenido…"
          ayuda="Podés agregar más de uno. Si no existe, queda pendiente de aprobación."
          onChange={setContenidoElegido}
        />

        <div className="campo">
          <label>Descripción</label>
          <textarea
            placeholder="Un par de líneas sobre el material…"
            value={descripcion}
            onChange={function (e) { setDescripcion(e.target.value) }}
          ></textarea>
        </div>

        <button className="subir-btn" type="submit" disabled={enviando}>
          {enviando ? 'Publicando...' : 'Publicar material'}
        </button>
      </form>
    </div>
  )
}

function App() {
  const [vista, setVista] = useState('inicio')
  const [busqueda, setBusqueda] = useState('')
  const [aniosElegidos, setAniosElegidos] = useState([])
  const [materiasElegidas, setMateriasElegidas] = useState([])
  const [contenidosElegidos, setContenidosElegidos] = useState([])
  const [tiposElegidos, setTiposElegidos] = useState([])
  const [materiales, setMateriales] = useState([])

  function cargarMateriales() {
    supabase.from('materiales').select('*').then(function (res) {
      if (res.error) {
        console.error(res.error)
      } else {
        setMateriales(res.data)
      }
    })
  }

  useEffect(function () {
    cargarMateriales()
  }, [])

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

  if (vista === 'formulario') {
    return (
      <FormularioSubida
        onVolver={function () { setVista('inicio') }}
        onPublicado={function () { cargarMateriales(); setVista('inicio') }}
      />
    )
  }

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
          <a className="subir-btn" href="#" onClick={function (e) { e.preventDefault(); setVista('formulario') }}>
            Subir material
          </a>
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

          <FiltroContenidoAlfabetico
            opciones={opcionesContenido}
            elegidos={contenidosElegidos}
            setElegidos={setContenidosElegidos}
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
                    key={m.id}
                    titulo={m.titulo}
                    materia={m.materia}
                    anio={m.anio}
                    tipo={m.tipo}
                    descripcion={m.descripcion}
                    autor={m.autor}
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