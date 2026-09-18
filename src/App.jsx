import { useState, useRef, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const BASE_MATERIA = [
  "Física", "Fisicoquímica", "Biología", "Matemática", "Química",
  "Partículas, Energía y Cosmología", "Radiación y Vida", "Química, Alimentación y Salud",
  "Ecología", "Historia de la Vida y de la Tierra", "Filosofía de la Ciencia y la Tecnología",
  "Problemáticas Científicas con Impacto Social", "Lógica y Filosofía de la Ciencia",
  "Matemática para la Física", "Física y Tecnología", "Problemáticas de la Física Actual", "Laboratorio"
]

const BASE_CONTENIDO = [
  "Álgebra", "Biotecnología", "Derivada", "Energía", "Estadística y probabilidad",
  "Evolución", "Geometría", "Integral", "Límite", "Salud y ambiente", "Universo y radiación"
]

const BASE_TIPO = [
  "Presentación", "Texto", "Planificación", "Proyecto / laboratorio", "Simulador", "Experimento", "Otros"
]

const iconosPorTipo = {
  'presentación': 'PRE',
  'texto': 'TXT',
  'planificación': 'PLA',
  'proyecto / laboratorio': 'LAB',
  'simulador': 'SIM',
  'experimento': 'EXP'
}

function iconoDeTipo(tipo) {
  const conocido = iconosPorTipo[tipo.toLowerCase()]
  if (conocido) return conocido
  // Tipo nuevo (sin ícono fijo): usamos las primeras 3 letras, en mayúsculas.
  return tipo.slice(0, 3).toUpperCase()
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
        <div className="tipo-icono">{iconoDeTipo(props.tipo)}</div>
      </div>
      <div className="tarjeta-acciones">
        {props.puedeEditar && (
          <button type="button" className="editar-btn" onClick={props.onEditar}>✎ Editar</button>
        )}
        {props.puedeBorrar && (
          <button type="button" className="borrar-btn" onClick={props.onBorrar}>🗑 Eliminar</button>
        )}
      </div>
      <h3>{props.titulo}</h3>
      <p className="desc">{props.descripcion}</p>
      <div className="tarjeta-links">
        {props.archivoUrl && (
          <a href={props.archivoUrl} target="_blank" rel="noopener" className="ver-archivo">
            Ver archivo ↗
          </a>
        )}
        {props.enlaceUrl && (
          <a href={props.enlaceUrl} target="_blank" rel="noopener" className="ver-archivo">
            Ver enlace ↗
          </a>
        )}
      </div>
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
// Tiene su PROPIO estado interno (elegidos, texto) -- cada vez que lo usás es independiente.
function ComboEtiquetas(props) {
  const [elegidos, setElegidos] = useState(props.inicial || [])
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
      reportar([nuevoChip]) // reemplaza, en vez de acumular
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

function AuthForm(props) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setCargando(true)

    const resultado = modo === 'login'
      ? await supabase.auth.signInWithPassword({ email: email, password: password })
      : await supabase.auth.signUp({ email: email, password: password })

    setCargando(false)

    if (resultado.error) {
      alert('Error: ' + resultado.error.message)
    } else if (modo === 'registro' && !resultado.data.session) {
      alert('¡Cuenta creada! Revisá tu email (y la carpeta de spam) y hacé clic en el link de confirmación antes de poder ingresar.')
      setModo('login')
    } else {
      props.onListo()
    }
  }

  return (
    <div className="wrap">
      <a className="volver" href="#" onClick={function (e) { e.preventDefault(); props.onVolver() }}>
        ← Volver a Materiales
      </a>
      <h1>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
      <p className="subtitulo">
        {modo === 'login'
          ? 'Ingresá con tu email y contraseña para poder subir y editar materiales.'
          : 'Creá una cuenta para poder subir y editar materiales.'}
      </p>

      <form onSubmit={enviar}>
        <div className="campo">
          <label>Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={function (e) { setEmail(e.target.value) }}
            required
          />
        </div>
        <div className="campo">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={function (e) { setPassword(e.target.value) }}
            required
          />
        </div>
        <button className="subir-btn" type="submit" disabled={cargando}>
          {cargando ? 'Un momento...' : (modo === 'login' ? 'Entrar' : 'Crear cuenta')}
        </button>
      </form>

      <p className="subtitulo" style={{ marginTop: '16px' }}>
        {modo === 'login' ? (
          <>
            ¿No tenés cuenta?{' '}
            <a href="#" onClick={function (e) { e.preventDefault(); setModo('registro') }}>Creá una</a>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{' '}
            <a href="#" onClick={function (e) { e.preventDefault(); setModo('login') }}>Iniciá sesión</a>
          </>
        )}
      </p>
    </div>
  )
}

function textoAChips(texto) {
  if (!texto) return []
  return texto.split(',').map(function (v) { return { valor: v.trim(), esNueva: false } })
}

function FormularioSubida(props) {
  const sesion = props.sesion
  const editando = Boolean(props.materialInicial)
  const original = props.materialInicial

  const [titulo, setTitulo] = useState(editando ? original.titulo : '')
  const [anio, setAnio] = useState(editando ? original.anio : 4)
  const [materiaElegida, setMateriaElegida] = useState(editando ? textoAChips(original.materia) : [])
  const [tipoElegido, setTipoElegido] = useState(editando ? textoAChips(original.tipo) : [])
  const [contenidoElegido, setContenidoElegido] = useState(editando ? textoAChips(original.contenido) : [])
  const [descripcion, setDescripcion] = useState(editando ? (original.descripcion || '') : '')
  const [archivo, setArchivo] = useState(null)
  const [enlace, setEnlace] = useState(editando ? (original.enlace_url || '') : '')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()

    if (titulo.trim() === '' || materiaElegida.length === 0 || tipoElegido.length === 0) {
      alert('Completá al menos el título, la materia y el tipo de archivo.')
      return
    }

    setEnviando(true)

    let archivoUrl = null

    if (archivo) {
      const nombreArchivo = Date.now() + '-' + archivo.name

      const { error: errorSubida } = await supabase.storage
        .from('materiales-archivos')
        .upload(nombreArchivo, archivo)

      if (errorSubida) {
        setEnviando(false)
        alert('Hubo un error al subir el archivo: ' + errorSubida.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from('materiales-archivos')
        .getPublicUrl(nombreArchivo)

      archivoUrl = urlData.publicUrl
    }

    const datosMaterial = {
      titulo: titulo.trim(),
      materia: materiaElegida.map(function (m) { return m.valor }).join(', '),
      anio: anio,
      tipo: tipoElegido[0].valor,
      contenido: contenidoElegido.map(function (c) { return c.valor }).join(', '),
      descripcion: descripcion.trim(),
      archivo_url: archivoUrl || (editando ? original.archivo_url : null),
      enlace_url: enlace.trim() === '' ? (editando ? original.enlace_url : null) : enlace.trim()
    }

    let error

    if (editando) {
      const resultado = await supabase.from('materiales').update(datosMaterial).eq('id', original.id)
      error = resultado.error
    } else {
      datosMaterial.autor = sesion.user.email
      datosMaterial.user_id = sesion.user.id
      const resultado = await supabase.from('materiales').insert(datosMaterial)
      error = resultado.error
    }

    const propuestasMateria = materiaElegida.filter(function (chip) { return chip.esNueva })
      .map(function (chip) { return { campo: 'materia', valor: chip.valor, creado_por: sesion.user.id } })
    const propuestasTipo = tipoElegido.filter(function (chip) { return chip.esNueva })
      .map(function (chip) { return { campo: 'tipo', valor: chip.valor, creado_por: sesion.user.id } })
    const propuestasContenido = contenidoElegido.filter(function (chip) { return chip.esNueva })
      .map(function (chip) { return { campo: 'contenido', valor: chip.valor, creado_por: sesion.user.id } })

    const filas = [...propuestasMateria, ...propuestasTipo, ...propuestasContenido]

    if (!error && filas.length > 0) {
      const resultadoPendientes = await supabase.from('valores_pendientes').insert(filas)
      if (resultadoPendientes.error) {
        console.error('Error al guardar valores pendientes:', resultadoPendientes.error)
        alert('El material se guardó, pero hubo un problema al registrar los valores nuevos como pendientes: ' + resultadoPendientes.error.message)
      }
    }

    setEnviando(false)

    if (error) {
      alert('Hubo un error al publicar: ' + error.message)
    } else {
      alert(editando ? '¡Material actualizado!' : '¡Material publicado!')
      props.onPublicado()
    }
  }

  return (
    <div className="wrap">
      <a className="volver" href="#" onClick={function (e) { e.preventDefault(); props.onVolver() }}>
        ← Volver a Materiales
      </a>
      <h1>{editando ? 'Editar material' : 'Subir material'}</h1>
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
          opciones={props.opcionesMateria}
          inicial={materiaElegida}
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
          opciones={props.opcionesTipo}
          unico={true}
          inicial={tipoElegido}
          placeholder="Escribí para buscar o agregar un tipo de archivo…"
          ayuda="Elegí uno solo. Si no está en la lista, se agrega como pendiente de aprobación."
          onChange={setTipoElegido}
        />

        <ComboEtiquetas
          titulo="Contenido"
          opciones={props.opcionesContenido}
          inicial={contenidoElegido}
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

        <div className="campo">
          <label>Archivo</label>
          <input
            type="file"
            onChange={function (e) { setArchivo(e.target.files[0]) }}
          />
          <p className="ayuda">Subí un PDF, imagen u otro archivo. Si preferís, dejá esto vacío y pegá un enlace abajo.</p>
        </div>

        <div className="campo">
          <label>O pegá un enlace</label>
          <input
            type="text"
            placeholder="Link a un video, Google Drive, simulador externo, etc."
            value={enlace}
            onChange={function (e) { setEnlace(e.target.value) }}
          />
          <p className="ayuda">Podés completar este y el archivo juntos (por ejemplo, un PDF y un link a un simulador).</p>
        </div>

        <button className="subir-btn" type="submit" disabled={enviando}>
          {enviando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Publicar material')}
        </button>
      </form>
    </div>
  )
}

function PanelAdmin(props) {
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)

  function cargarPendientes() {
    setCargando(true)
    supabase
      .from('valores_pendientes')
      .select('*')
      .eq('estado', 'pendiente')
      .then(function (res) {
        setCargando(false)
        if (!res.error) setPendientes(res.data)
      })
  }

  useEffect(function () {
    cargarPendientes()
  }, [])

  async function decidir(id, nuevoEstado) {
    await supabase.from('valores_pendientes').update({ estado: nuevoEstado }).eq('id', id)
    cargarPendientes()
  }

  return (
    <div className="wrap">
      <a className="volver" href="#" onClick={function (e) { e.preventDefault(); props.onVolver() }}>
        ← Volver a Materiales
      </a>
      <h1>Panel de administración</h1>
      <p className="subtitulo">Valores nuevos propuestos por usuarios, esperando aprobación.</p>

      {cargando ? (
        <p className="subtitulo">Cargando...</p>
      ) : pendientes.length === 0 ? (
        <p className="subtitulo">No hay nada pendiente por ahora.</p>
      ) : (
        pendientes.map(function (p) {
          return (
            <div className="pendiente-item" key={p.id}>
              <div>
                <span className="pendiente-campo">{p.campo}</span>
                <strong className="pendiente-valor">{p.valor}</strong>
              </div>
              <div className="pendiente-acciones">
                <button type="button" className="aprobar-btn" onClick={function () { decidir(p.id, 'aprobado') }}>
                  Aprobar
                </button>
                <button type="button" className="rechazar-btn" onClick={function () { decidir(p.id, 'rechazado') }}>
                  Rechazar
                </button>
              </div>
            </div>
          )
        })
      )}
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
  const [sesion, setSesion] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [materialEditando, setMaterialEditando] = useState(null)
  const [opcionesMateria, setOpcionesMateria] = useState(BASE_MATERIA)
  const [opcionesContenido, setOpcionesContenido] = useState(BASE_CONTENIDO)
  const [opcionesTipo, setOpcionesTipo] = useState(BASE_TIPO)

  function combinarConAprobados(base, campo, aprobados) {
    const nuevos = aprobados
      .filter(function (p) { return p.campo === campo })
      .map(function (p) { return p.valor })

    const combinado = [...base]
    nuevos.forEach(function (valor) {
      const yaEsta = combinado.some(function (o) { return o.toLowerCase() === valor.toLowerCase() })
      if (!yaEsta) combinado.push(valor)
    })
    return combinado.sort()
  }

  function cargarOpciones() {
    supabase.from('valores_pendientes').select('*').eq('estado', 'aprobado').then(function (res) {
      if (res.error) {
        console.error(res.error)
        return
      }
      setOpcionesMateria(combinarConAprobados(BASE_MATERIA, 'materia', res.data))
      setOpcionesContenido(combinarConAprobados(BASE_CONTENIDO, 'contenido', res.data))
      setOpcionesTipo(combinarConAprobados(BASE_TIPO, 'tipo', res.data))
    })
  }

  useEffect(function () {
    cargarOpciones()
  }, [])

  useEffect(function () {
    if (!sesion) {
      setEsAdmin(false)
      return
    }
    supabase.from('admins').select('user_id').eq('user_id', sesion.user.id).then(function (res) {
      setEsAdmin(Boolean(res.data && res.data.length > 0))
    })
  }, [sesion])

  useEffect(function () {
    supabase.auth.getSession().then(function (res) {
      setSesion(res.data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(function (_evento, nuevaSesion) {
      setSesion(nuevaSesion)
    })

    return function () {
      listener.subscription.unsubscribe()
    }
  }, [])

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

  async function borrarMaterial(id) {
    const confirmado = window.confirm('¿Seguro que querés eliminar este material? Esta acción no se puede deshacer.')
    if (!confirmado) return

    const { error } = await supabase.from('materiales').delete().eq('id', id)

    if (error) {
      alert('Hubo un error al eliminar: ' + error.message)
    } else {
      cargarMateriales()
    }
  }

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

  if (vista === 'login') {
    return (
      <AuthForm
        onVolver={function () { setVista('inicio') }}
        onListo={function () { setVista('inicio') }}
      />
    )
  }

  if (vista === 'formulario') {
    return (
      <FormularioSubida
        sesion={sesion}
        opcionesMateria={opcionesMateria}
        opcionesContenido={opcionesContenido}
        opcionesTipo={opcionesTipo}
        onVolver={function () { setVista('inicio') }}
        onPublicado={function () { cargarMateriales(); setVista('inicio') }}
      />
    )
  }

  if (vista === 'editar') {
    return (
      <FormularioSubida
        sesion={sesion}
        materialInicial={materialEditando}
        opcionesMateria={opcionesMateria}
        opcionesContenido={opcionesContenido}
        opcionesTipo={opcionesTipo}
        onVolver={function () { setVista('inicio') }}
        onPublicado={function () { cargarMateriales(); setVista('inicio') }}
      />
    )
  }

  if (vista === 'admin') {
    return <PanelAdmin onVolver={function () { cargarOpciones(); setVista('inicio') }} />
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
          {sesion ? (
            <>
              <span className="sesion-email">{sesion.user.email}</span>
              {esAdmin && (
                <a className="donar-btn" href="#" onClick={function (e) { e.preventDefault(); setVista('admin') }}>Panel admin</a>
              )}
              <a className="donar-btn" href="#" onClick={function (e) { e.preventDefault(); supabase.auth.signOut() }}>Cerrar sesión</a>
              <a className="subir-btn" href="#" onClick={function (e) { e.preventDefault(); setVista('formulario') }}>Subir material</a>
            </>
          ) : (
            <a className="subir-btn" href="#" onClick={function (e) { e.preventDefault(); setVista('login') }}>Iniciar sesión para subir</a>
          )}
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
                    archivoUrl={m.archivo_url}
                    enlaceUrl={m.enlace_url}
                    puedeEditar={Boolean(sesion) && (sesion.user.id === m.user_id || esAdmin)}
                    onEditar={function () { setMaterialEditando(m); setVista('editar') }}
                    puedeBorrar={esAdmin}
                    onBorrar={function () { borrarMaterial(m.id) }}
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