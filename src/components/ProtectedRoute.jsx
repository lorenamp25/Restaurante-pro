import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setAllowed(false)
      setLoading(false)
      return
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    setAllowed(!error && !!admin)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="
        min-h-screen
        bg-gray-950
        text-white
        flex
        items-center
        justify-center
      ">
        Comprobando acceso...
      </div>
    )
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute