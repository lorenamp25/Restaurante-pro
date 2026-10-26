import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    // Iniciar sesión
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    if (loginError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Comprobar si ese usuario es administrador
    const { data: admin, error: adminError } =
      await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

    if (adminError || !admin) {
      await supabase.auth.signOut()

      setError(
        'Este usuario no tiene permisos de administrador.'
      )

      setLoading(false)
      return
    }

    // Todo correcto
    navigate('/admin')
  }

  return (
    <div className="
      min-h-screen
      bg-gray-950
      flex
      items-center
      justify-center
      px-6
    ">

      <div className="
        bg-white
        w-full
        max-w-md
        rounded-3xl
        p-8
        shadow-2xl
      ">

        <div className="text-center mb-8">

          <p className="
            text-orange-500
            font-bold
            text-sm
          ">
            RESTAURANTE PRO
          </p>

          <h1 className="
            text-3xl
            font-bold
            mt-2
          ">
            Panel de administración
          </h1>

          <p className="
            text-gray-500
            mt-2
          ">
            Acceso para personal autorizado
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <label className="font-semibold">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            placeholder="admin@restaurantepro.es"
            className="
              w-full
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              mt-2
              mb-5
              outline-none
              focus:border-orange-500
            "
          />

          <label className="font-semibold">
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            placeholder="••••••••"
            className="
              w-full
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              mt-2
              outline-none
              focus:border-orange-500
            "
          />

          {error && (
            <div className="
              bg-red-50
              text-red-600
              p-3
              rounded-xl
              mt-4
            ">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-orange-500
              hover:bg-orange-600
              disabled:bg-gray-400
              text-white
              font-bold
              py-4
              rounded-xl
              mt-6
              cursor-pointer
              disabled:cursor-not-allowed
            "
          >
            {loading
              ? 'Entrando...'
              : 'Iniciar sesión'}
          </button>

        </form>

        <button
          onClick={() => navigate('/')}
          className="
            w-full
            mt-5
            text-gray-500
            hover:text-black
            cursor-pointer
          "
        >
          ← Volver a la carta
        </button>

      </div>

    </div>
  )
}

export default AdminLogin