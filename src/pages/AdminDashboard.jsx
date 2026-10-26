import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminDashboard() {
  const navigate = useNavigate()

  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function logout() {
    if (loggingOut) return

    setLoggingOut(true)
    setLogoutError('')

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error cerrando sesión:', error)
      setLogoutError('No se ha podido cerrar la sesión.')
      setLoggingOut(false)
      return
    }

    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =========================
          CABECERA
      ========================= */}

      <header className="bg-gray-950 text-white">

        <div
          className="
            max-w-6xl
            mx-auto
            px-4
            sm:px-6
            py-7
            flex
            flex-col
            sm:flex-row
            sm:justify-between
            sm:items-center
            gap-5
          "
        >

          <div>

            <p className="text-orange-500 font-bold text-sm tracking-wide">
              RESTAURANTE PRO
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Administración
            </h1>

            <p className="text-gray-400 mt-2">
              Panel de gestión del restaurante
            </p>

          </div>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="
              border
              border-gray-700
              px-5
              py-2.5
              rounded-xl
              hover:bg-gray-800
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
              transition
              whitespace-nowrap
              self-start
              sm:self-auto
            "
          >
            {loggingOut
              ? 'Cerrando sesión...'
              : 'Cerrar sesión'}
          </button>

        </div>

      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ERROR LOGOUT */}

        {logoutError && (

          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-xl
              p-4
              mb-6
            "
          >
            ⚠️ {logoutError}
          </div>

        )}

        {/* INTRODUCCIÓN */}

        <div className="mb-8">

          <p className="text-orange-500 font-bold text-sm">
            PANEL DE CONTROL
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            ¿Qué quieres gestionar?
          </h2>

          <p className="text-gray-500 mt-2">
            Selecciona una sección para empezar.
          </p>

        </div>

        {/* =========================
            TARJETAS
        ========================= */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-5
          "
        >

          {/* COCINA */}

          <button
            onClick={() => navigate('/admin/cocina')}
            className="
              bg-white
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              duration-300
              text-left
              cursor-pointer
              group
              flex
              flex-col
            "
          >

            <div
              className="
                w-14
                h-14
                bg-orange-100
                rounded-2xl
                flex
                items-center
                justify-center
                text-3xl
              "
            >
              🍳
            </div>

            <h3 className="text-2xl font-bold mt-5">
              Cocina
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed flex-1">
              Gestiona los pedidos y controla su estado en tiempo real.
            </p>

            <p
              className="
                text-orange-500
                font-bold
                mt-6
                group-hover:translate-x-1
                transition
              "
            >
              Ver pedidos →
            </p>

          </button>

          {/* CARTA */}

          <button
            onClick={() => navigate('/admin/carta')}
            className="
              bg-white
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              duration-300
              text-left
              cursor-pointer
              group
              flex
              flex-col
            "
          >

            <div
              className="
                w-14
                h-14
                bg-green-100
                rounded-2xl
                flex
                items-center
                justify-center
                text-3xl
              "
            >
              🍽️
            </div>

            <h3 className="text-2xl font-bold mt-5">
              Carta
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed flex-1">
              Gestiona platos, precios, imágenes y disponibilidad.
            </p>

            <p
              className="
                text-green-600
                font-bold
                mt-6
                group-hover:translate-x-1
                transition
              "
            >
              Gestionar carta →
            </p>

          </button>

          {/* CATEGORÍAS */}

          <button
            onClick={() => navigate('/admin/categorias')}
            className="
              bg-white
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              duration-300
              text-left
              cursor-pointer
              group
              flex
              flex-col
            "
          >

            <div
              className="
                w-14
                h-14
                bg-purple-100
                rounded-2xl
                flex
                items-center
                justify-center
                text-3xl
              "
            >
              📂
            </div>

            <h3 className="text-2xl font-bold mt-5">
              Categorías
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed flex-1">
              Crea, edita y organiza las categorías de la carta.
            </p>

            <p
              className="
                text-purple-600
                font-bold
                mt-6
                group-hover:translate-x-1
                transition
              "
            >
              Gestionar categorías →
            </p>

          </button>

          {/* ESTADÍSTICAS */}

          <button
            onClick={() => navigate('/admin/estadisticas')}
            className="
              bg-white
              rounded-2xl
              p-6
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition
              duration-300
              text-left
              cursor-pointer
              group
              flex
              flex-col
            "
          >

            <div
              className="
                w-14
                h-14
                bg-blue-100
                rounded-2xl
                flex
                items-center
                justify-center
                text-3xl
              "
            >
              📊
            </div>

            <h3 className="text-2xl font-bold mt-5">
              Estadísticas
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed flex-1">
              Analiza ventas, pedidos y productos más vendidos.
            </p>

            <p
              className="
                text-blue-600
                font-bold
                mt-6
                group-hover:translate-x-1
                transition
              "
            >
              Ver estadísticas →
            </p>

          </button>

        </div>

        {/* =========================
            ACCESO A LA CARTA
        ========================= */}

        <div
          className="
            bg-gray-950
            text-white
            rounded-2xl
            p-6
            mt-8
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-5
          "
        >

          <div>

            <p className="font-bold text-lg">
              Ver la carta como cliente
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Comprueba cómo ven los clientes los platos disponibles.
            </p>

          </div>

          <button
            onClick={() => navigate('/')}
            className="
              bg-white
              hover:bg-gray-100
              text-gray-950
              px-5
              py-3
              rounded-xl
              font-bold
              cursor-pointer
              transition
              whitespace-nowrap
            "
          >
            Abrir carta →
          </button>

        </div>

      </main>

    </div>
  )
}

export default AdminDashboard