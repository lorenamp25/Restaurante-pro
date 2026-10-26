import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

function Checkout() {
  const {
    cart,
    totalItems,
    totalPrice,
    clearCart
  } = useCart()

  const navigate = useNavigate()

  const [tableNumber, setTableNumber] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // =========================
  // CONFIRMAR PEDIDO
  // =========================

  async function confirmOrder() {
    if (sending) return

    setError('')

    const table = Number(tableNumber)

    // Validar mesa
    if (
      tableNumber.trim() === '' ||
      !Number.isInteger(table) ||
      table <= 0
    ) {
      setError('Introduce un número de mesa válido.')
      return
    }

    // Validar carrito
    if (cart.length === 0) {
      setError('El pedido está vacío.')
      return
    }

    // Validar cantidades
    const invalidItem = cart.some(
      item =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
    )

    if (invalidItem) {
      setError(
        'Hay un producto con una cantidad no válida.'
      )
      return
    }

    setSending(true)

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: Number(item.quantity)
      }))

      const { data, error } = await supabase.rpc(
        'create_restaurant_order',
        {
          p_table_number: table,
          p_items: items
        }
      )

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error(
          'No se recibió el identificador del pedido.'
        )
      }

      clearCart()

      navigate(`/pedido-confirmado/${data}`)

    } catch (error) {
      console.error(
        'Error creando el pedido:',
        error
      )

      setError(
        'No se ha podido enviar el pedido. Inténtalo de nuevo.'
      )

      setSending(false)
    }
  }

  // =========================
  // CARRITO VACÍO
  // =========================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">

        <header className="bg-gray-950 text-white">

          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

            <p className="text-orange-500 font-bold text-sm tracking-wide">
              RESTAURANTE PRO
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Confirmar pedido
            </h1>

          </div>

        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">

            <div
              className="
                w-20
                h-20
                bg-orange-100
                rounded-full
                flex
                items-center
                justify-center
                text-4xl
                mx-auto
              "
            >
              🛒
            </div>

            <h2 className="text-2xl font-bold mt-6">
              No tienes productos
            </h2>

            <p className="text-gray-500 mt-2">
              Añade algún plato antes de confirmar el pedido.
            </p>

            <button
              onClick={() => navigate('/')}
              className="
                mt-7
                bg-orange-500
                hover:bg-orange-600
                text-white
                px-7
                py-3
                rounded-xl
                font-bold
                cursor-pointer
                transition
              "
            >
              Ver carta
            </button>

          </div>

        </main>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =========================
          CABECERA
      ========================= */}

      <header className="bg-gray-950 text-white">

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          <button
            onClick={() => navigate('/pedido')}
            disabled={sending}
            className="
              text-gray-400
              hover:text-white
              disabled:opacity-50
              cursor-pointer
              disabled:cursor-not-allowed
              transition
            "
          >
            ← Volver al pedido
          </button>

          <p className="text-orange-500 font-bold text-sm tracking-wide mt-5">
            RESTAURANTE PRO
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            Confirmar pedido
          </h1>

          <p className="text-gray-400 mt-2">
            Revisa tu pedido e indica el número de tu mesa.
          </p>

        </div>

      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-12">

        {/* =========================
            PASO 1 - MESA
        ========================= */}

        <div className="bg-white rounded-2xl p-6 shadow-sm">

          <div className="flex items-start gap-4">

            <div
              className="
                w-11
                h-11
                bg-orange-100
                text-orange-600
                rounded-xl
                flex
                items-center
                justify-center
                font-bold
                flex-shrink-0
              "
            >
              1
            </div>

            <div className="flex-1">

              <h2 className="font-bold text-xl">
                Indica tu mesa
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Necesitamos saber dónde entregar el pedido.
              </p>

            </div>

          </div>

          <div className="mt-6">

            <label
              htmlFor="table"
              className="block font-semibold text-gray-700"
            >
              Número de mesa
            </label>

            <input
              id="table"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={tableNumber}
              disabled={sending}
              onChange={e => {
                setTableNumber(e.target.value)

                if (error) {
                  setError('')
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  confirmOrder()
                }
              }}
              placeholder="Ej. 7"
              className="
                w-full
                mt-3
                border
                border-gray-300
                rounded-xl
                px-4
                py-4
                text-lg
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
                transition
              "
            />

            {error && (

              <div
                className="
                  mt-4
                  bg-red-50
                  border
                  border-red-200
                  text-red-700
                  rounded-xl
                  p-4
                  flex
                  gap-3
                  items-start
                "
              >

                <span>
                  ⚠️
                </span>

                <p className="text-sm font-medium">
                  {error}
                </p>

              </div>

            )}

          </div>

        </div>

        {/* =========================
            PASO 2 - RESUMEN
        ========================= */}

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-5">

          <div className="flex items-start gap-4 mb-6">

            <div
              className="
                w-11
                h-11
                bg-orange-100
                text-orange-600
                rounded-xl
                flex
                items-center
                justify-center
                font-bold
                flex-shrink-0
              "
            >
              2
            </div>

            <div>

              <h2 className="font-bold text-xl">
                Revisa tu pedido
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Comprueba que todo esté correcto antes de enviarlo.
              </p>

            </div>

          </div>

          {/* PRODUCTOS */}

          <div className="divide-y divide-gray-100">

            {cart.map(item => (

              <div
                key={item.id}
                className="flex items-center gap-4 py-4"
              >

                {/* FOTO */}

                {item.image_url ? (

                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="
                      w-16
                      h-16
                      rounded-xl
                      object-cover
                      flex-shrink-0
                    "
                  />

                ) : (

                  <div
                    className="
                      w-16
                      h-16
                      rounded-xl
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                      text-2xl
                      flex-shrink-0
                    "
                  >
                    🍽️
                  </div>

                )}

                {/* PRODUCTO */}

                <div className="flex-1 min-w-0">

                  <p className="font-bold">
                    {item.name}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {item.quantity} ×{' '}
                    {Number(item.price).toFixed(2)} €
                  </p>

                </div>

                {/* SUBTOTAL */}

                <span className="font-bold whitespace-nowrap">
                  {(
                    Number(item.price) *
                    item.quantity
                  ).toFixed(2)} €
                </span>

              </div>

            ))}

          </div>

          {/* RESUMEN */}

          <div className="mt-5 pt-5 border-t border-gray-200">

            <div className="flex justify-between text-gray-500">

              <span>
                Productos
              </span>

              <span>
                {totalItems}{' '}
                {totalItems === 1
                  ? 'unidad'
                  : 'unidades'}
              </span>

            </div>

            <div className="flex justify-between items-end mt-5">

              <div>

                <p className="text-xl font-bold">
                  Total
                </p>

                <p className="text-gray-400 text-xs mt-1">
                  IVA incluido
                </p>

              </div>

              <span className="text-3xl font-bold">
                {totalPrice.toFixed(2)} €
              </span>

            </div>

          </div>

          {/* =========================
              CONFIRMAR
          ========================= */}

          <button
            onClick={confirmOrder}
            disabled={sending}
            className="
              w-full
              mt-7
              bg-orange-500
              hover:bg-orange-600
              disabled:bg-gray-400
              text-white
              py-4
              rounded-xl
              font-bold
              text-lg
              cursor-pointer
              disabled:cursor-not-allowed
              transition
            "
          >

            {sending ? (

              <span className="flex items-center justify-center gap-2">
                <span>⏳</span>
                Enviando pedido...
              </span>

            ) : (

              <span>
                Enviar pedido · {totalPrice.toFixed(2)} €
              </span>

            )}

          </button>

          <p className="text-center text-gray-400 text-xs mt-4">
            Al confirmar, el pedido se enviará directamente a cocina.
          </p>

        </div>

      </main>

    </div>
  )
}

export default Checkout