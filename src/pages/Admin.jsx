import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Admin() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // =========================
  // REALTIME
  // =========================

  useEffect(() => {
    loadOrders()

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          loadOrders(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // =========================
  // CARGAR PEDIDOS
  // =========================

  async function loadOrders(showLoading = true) {
    if (showLoading) {
      setLoading(true)
    }

    setError('')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError('No se han podido cargar los pedidos.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    setOrders(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  // =========================
  // ACTUALIZAR MANUALMENTE
  // =========================

  async function refreshOrders() {
    if (refreshing) return

    setRefreshing(true)
    await loadOrders(false)
  }

  // =========================
  // CAMBIAR ESTADO
  // =========================

  async function changeStatus(orderId, newStatus) {
    if (updatingOrder === orderId) return

    setUpdatingOrder(orderId)

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error(error)
      alert('No se pudo actualizar el pedido.')
      setUpdatingOrder(null)
      return
    }

    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    )

    setUpdatingOrder(null)
  }

  // =========================
  // CERRAR SESIÓN
  // =========================

  async function logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error(error)
      alert('No se ha podido cerrar la sesión.')
      return
    }

    navigate('/admin/login', { replace: true })
  }

  // =========================
  // ESTADOS
  // =========================

  function statusText(status) {
    if (status === 'pending') return 'Pendiente'
    if (status === 'preparing') return 'Preparando'
    if (status === 'ready') return 'Listo'
    if (status === 'delivered') return 'Entregado'

    return status
  }

  function statusClass(status) {
    if (status === 'pending') {
      return 'bg-orange-100 text-orange-700'
    }

    if (status === 'preparing') {
      return 'bg-blue-100 text-blue-700'
    }

    if (status === 'ready') {
      return 'bg-green-100 text-green-700'
    }

    return 'bg-gray-200 text-gray-700'
  }

  // =========================
  // FECHA Y HORA
  // =========================

  function formatTime(date) {
    if (!date) return ''

    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatDate(date) {
    if (!date) return ''

    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  // =========================
  // CONTADORES
  // =========================

  const counts = {
    all: orders.length,
    pending: orders.filter(
      order => order.status === 'pending'
    ).length,
    preparing: orders.filter(
      order => order.status === 'preparing'
    ).length,
    ready: orders.filter(
      order => order.status === 'ready'
    ).length,
    delivered: orders.filter(
      order => order.status === 'delivered'
    ).length
  }

  // =========================
  // FILTRO
  // =========================

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter(
          order => order.status === filter
        )

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =========================
          CABECERA
      ========================= */}

      <header className="bg-gray-950 text-white">

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            py-6
            flex
            flex-col
            md:flex-row
            md:justify-between
            md:items-center
            gap-5
          "
        >

          <div>

            <button
              onClick={() => navigate('/admin')}
              className="
                text-gray-400
                hover:text-white
                text-sm
                cursor-pointer
                transition
                mb-3
              "
            >
              ← Volver al panel
            </button>

            <p className="text-orange-500 font-bold text-sm">
              RESTAURANTE PRO
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Panel de cocina
            </h1>

            <p className="text-gray-400 mt-1">
              Pedidos en tiempo real
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={refreshOrders}
              disabled={refreshing}
              className="
                border
                border-gray-600
                px-4
                py-2.5
                rounded-xl
                hover:bg-gray-800
                disabled:opacity-50
                disabled:cursor-not-allowed
                cursor-pointer
                transition
              "
            >
              {refreshing
                ? 'Actualizando...'
                : '↻ Actualizar'}
            </button>

            <button
              onClick={logout}
              className="
                border
                border-gray-600
                px-4
                py-2.5
                rounded-xl
                hover:bg-gray-800
                cursor-pointer
                transition
              "
            >
              Cerrar sesión
            </button>

          </div>

        </div>

      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* TÍTULO */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:justify-between
            sm:items-center
            gap-4
            mb-7
          "
        >

          <div>

            <h2 className="text-2xl font-bold">
              Pedidos
            </h2>

            <p className="text-gray-500 mt-1">
              Gestiona los pedidos del restaurante.
            </p>

          </div>

          <div
            className="
              bg-white
              rounded-xl
              px-5
              py-3
              shadow-sm
              self-start
            "
          >

            <span className="text-gray-500">
              Pedidos:
            </span>

            <span className="font-bold ml-2">
              {orders.length}
            </span>

          </div>

        </div>

        {/* =========================
            FILTROS
        ========================= */}

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-5
            gap-3
            mb-7
          "
        >

          <button
            onClick={() => setFilter('all')}
            className={`
              p-4
              rounded-xl
              text-left
              cursor-pointer
              transition
              ${
                filter === 'all'
                  ? 'bg-gray-950 text-white shadow-md'
                  : 'bg-white hover:bg-gray-50'
              }
            `}
          >
            <p className="text-sm opacity-70">
              Todos
            </p>

            <p className="text-2xl font-bold">
              {counts.all}
            </p>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`
              p-4
              rounded-xl
              text-left
              cursor-pointer
              transition
              ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white hover:bg-orange-50'
              }
            `}
          >
            <p className="text-sm opacity-70">
              Pendientes
            </p>

            <p className="text-2xl font-bold">
              {counts.pending}
            </p>
          </button>

          <button
            onClick={() => setFilter('preparing')}
            className={`
              p-4
              rounded-xl
              text-left
              cursor-pointer
              transition
              ${
                filter === 'preparing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white hover:bg-blue-50'
              }
            `}
          >
            <p className="text-sm opacity-70">
              Preparando
            </p>

            <p className="text-2xl font-bold">
              {counts.preparing}
            </p>
          </button>

          <button
            onClick={() => setFilter('ready')}
            className={`
              p-4
              rounded-xl
              text-left
              cursor-pointer
              transition
              ${
                filter === 'ready'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white hover:bg-green-50'
              }
            `}
          >
            <p className="text-sm opacity-70">
              Listos
            </p>

            <p className="text-2xl font-bold">
              {counts.ready}
            </p>
          </button>

          <button
            onClick={() => setFilter('delivered')}
            className={`
              p-4
              rounded-xl
              text-left
              cursor-pointer
              transition
              ${
                filter === 'delivered'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-white hover:bg-gray-50'
              }
            `}
          >
            <p className="text-sm opacity-70">
              Entregados
            </p>

            <p className="text-2xl font-bold">
              {counts.delivered}
            </p>
          </button>

        </div>

        {/* =========================
            CARGANDO
        ========================= */}

        {loading && (

          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">

            <div className="text-4xl mb-3">
              🍳
            </div>

            <p className="font-bold">
              Cargando pedidos...
            </p>

          </div>

        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-2xl
              p-5
            "
          >
            ⚠️ {error}
          </div>

        )}

        {/* =========================
            SIN PEDIDOS
        ========================= */}

        {!loading && !error && orders.length === 0 && (

          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">

            <p className="text-5xl">
              🍳
            </p>

            <p className="text-xl font-bold mt-4">
              No hay pedidos
            </p>

            <p className="text-gray-500 mt-2">
              Los nuevos pedidos aparecerán aquí automáticamente.
            </p>

          </div>

        )}

        {/* SIN PEDIDOS EN FILTRO */}

        {!loading &&
          !error &&
          orders.length > 0 &&
          filteredOrders.length === 0 && (

            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">

              <p className="text-4xl">
                📋
              </p>

              <p className="text-xl font-bold mt-4">
                No hay pedidos en este estado
              </p>

              <p className="text-gray-500 mt-2">
                Selecciona otro filtro para ver más pedidos.
              </p>

            </div>

          )}

        {/* =========================
            PEDIDOS
        ========================= */}

        {!loading &&
          !error &&
          filteredOrders.length > 0 && (

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
              "
            >

              {filteredOrders.map(order => (

                <article
                  key={order.id}
                  className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                    flex
                    flex-col
                  "
                >

                  {/* CABECERA PEDIDO */}

                  <div className="p-5 border-b border-gray-200">

                    <div className="flex justify-between items-start gap-3">

                      <div>

                        <p className="text-gray-500 text-xs font-semibold">
                          PEDIDO #{order.id}
                        </p>

                        <h3 className="text-2xl font-bold mt-1">
                          Mesa {order.table_number}
                        </h3>

                        <p className="text-gray-400 text-sm mt-1">
                          {formatDate(order.created_at)}
                          {' · '}
                          {formatTime(order.created_at)}
                        </p>

                      </div>

                      <span
                        className={`
                          px-3
                          py-1.5
                          rounded-full
                          text-sm
                          font-bold
                          whitespace-nowrap
                          ${statusClass(order.status)}
                        `}
                      >
                        {statusText(order.status)}
                      </span>

                    </div>

                  </div>

                  {/* PRODUCTOS */}

                  <div className="p-5 flex flex-col flex-1">

                    <p className="font-bold mb-4">
                      Productos
                    </p>

                    <div className="space-y-3 flex-1">

                      {order.order_items?.map(item => (

                        <div
                          key={item.id}
                          className="
                            flex
                            justify-between
                            items-start
                            gap-4
                          "
                        >

                          <div className="flex-1">

                            <span className="font-bold">
                              {item.quantity} ×
                            </span>

                            <span className="ml-2">
                              {item.product_name}
                            </span>

                          </div>

                          <span className="text-gray-500 whitespace-nowrap">
                            {Number(item.subtotal).toFixed(2)} €
                          </span>

                        </div>

                      ))}

                    </div>

                    {/* TOTAL */}

                    <div
                      className="
                        border-t
                        border-gray-200
                        mt-5
                        pt-4
                        flex
                        justify-between
                        items-center
                      "
                    >

                      <span className="font-bold">
                        Total
                      </span>

                      <span className="text-xl font-bold">
                        {Number(order.total).toFixed(2)} €
                      </span>

                    </div>

                    {/* =========================
                        BOTONES DE ESTADO
                    ========================= */}

                    <div className="mt-5">

                      {order.status === 'pending' && (

                        <button
                          onClick={() =>
                            changeStatus(
                              order.id,
                              'preparing'
                            )
                          }
                          disabled={
                            updatingOrder === order.id
                          }
                          className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:bg-gray-400
                            text-white
                            font-bold
                            py-3
                            rounded-xl
                            cursor-pointer
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          {updatingOrder === order.id
                            ? 'Actualizando...'
                            : '👨‍🍳 Empezar a preparar'}
                        </button>

                      )}

                      {order.status === 'preparing' && (

                        <button
                          onClick={() =>
                            changeStatus(
                              order.id,
                              'ready'
                            )
                          }
                          disabled={
                            updatingOrder === order.id
                          }
                          className="
                            w-full
                            bg-green-600
                            hover:bg-green-700
                            disabled:bg-gray-400
                            text-white
                            font-bold
                            py-3
                            rounded-xl
                            cursor-pointer
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          {updatingOrder === order.id
                            ? 'Actualizando...'
                            : '✓ Marcar como listo'}
                        </button>

                      )}

                      {order.status === 'ready' && (

                        <button
                          onClick={() =>
                            changeStatus(
                              order.id,
                              'delivered'
                            )
                          }
                          disabled={
                            updatingOrder === order.id
                          }
                          className="
                            w-full
                            bg-gray-900
                            hover:bg-black
                            disabled:bg-gray-400
                            text-white
                            font-bold
                            py-3
                            rounded-xl
                            cursor-pointer
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          {updatingOrder === order.id
                            ? 'Actualizando...'
                            : '🍽️ Marcar como entregado'}
                        </button>

                      )}

                      {order.status === 'delivered' && (

                        <div
                          className="
                            bg-gray-100
                            text-gray-500
                            text-center
                            py-3
                            rounded-xl
                            font-bold
                          "
                        >
                          ✓ Pedido entregado
                        </div>

                      )}

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

      </main>

    </div>
  )
}

export default Admin