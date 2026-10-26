import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

function Cart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    deleteFromCart,
    totalItems,
    totalPrice
  } = useCart()

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =========================
          CABECERA
      ========================= */}

      <header className="bg-gray-950 text-white">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          <button
            onClick={() => navigate('/')}
            className="
              text-gray-400
              hover:text-white
              mb-5
              cursor-pointer
              transition
              flex
              items-center
              gap-2
            "
          >
            ← Volver a la carta
          </button>

          <p className="text-orange-500 font-bold text-sm tracking-wide">
            RESTAURANTE PRO
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            Tu pedido
          </h1>

          <p className="text-gray-400 mt-2">
            Revisa tus platos antes de continuar.
          </p>

        </div>

      </header>

      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-12">

        {cart.length === 0 ? (

          /* =========================
              CARRITO VACÍO
          ========================= */

          <div className="bg-white rounded-2xl p-10 md:p-14 text-center shadow-sm">

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
              Tu pedido está vacío
            </h2>

            <p className="text-gray-500 mt-2">
              Añade algún plato de nuestra carta para empezar.
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

        ) : (

          <>
            {/* =========================
                RESUMEN SUPERIOR
            ========================= */}

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold">
                Productos
              </h2>

              <span className="text-gray-500 text-sm">
                {totalItems}{' '}
                {totalItems === 1
                  ? 'unidad'
                  : 'unidades'}
              </span>

            </div>

            {/* =========================
                PRODUCTOS
            ========================= */}

            <div className="space-y-4">

              {cart.map(item => (

                <article
                  key={item.id}
                  className="
                    bg-white
                    rounded-2xl
                    p-4
                    sm:p-5
                    shadow-sm
                  "
                >

                  <div className="flex gap-4">

                    {/* IMAGEN */}

                    <div className="flex-shrink-0">

                      {item.image_url ? (

                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="
                            w-24
                            h-24
                            sm:w-28
                            sm:h-28
                            rounded-xl
                            object-cover
                          "
                        />

                      ) : (

                        <div
                          className="
                            w-24
                            h-24
                            sm:w-28
                            sm:h-28
                            bg-gray-100
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-3xl
                          "
                        >
                          🍽️
                        </div>

                      )}

                    </div>

                    {/* INFORMACIÓN */}

                    <div className="flex-1 min-w-0">

                      <div className="flex justify-between gap-3">

                        <div className="min-w-0">

                          {item.categories?.name && (

                            <p className="text-xs font-bold text-orange-500 uppercase">
                              {item.categories.name}
                            </p>

                          )}

                          <h2 className="text-lg sm:text-xl font-bold mt-1">
                            {item.name}
                          </h2>

                          <p className="text-gray-500 text-sm mt-1">
                            {Number(item.price).toFixed(2)} € / unidad
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            deleteFromCart(item.id)
                          }
                          className="
                            text-gray-400
                            hover:text-red-600
                            cursor-pointer
                            transition
                            text-sm
                            h-fit
                          "
                        >
                          Eliminar
                        </button>

                      </div>

                      {/* CANTIDAD Y SUBTOTAL */}

                      <div
                        className="
                          flex
                          flex-col
                          sm:flex-row
                          sm:justify-between
                          sm:items-end
                          gap-4
                          mt-5
                        "
                      >

                        {/* CONTADOR */}

                        <div>

                          <p className="text-xs text-gray-400 mb-2">
                            Cantidad
                          </p>

                          <div
                            className="
                              inline-flex
                              items-center
                              bg-gray-100
                              rounded-xl
                              p-1
                            "
                          >

                            <button
                              onClick={() =>
                                removeFromCart(item.id)
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                bg-white
                                hover:bg-gray-200
                                font-bold
                                text-xl
                                cursor-pointer
                                transition
                                shadow-sm
                              "
                            >
                              −
                            </button>

                            <span
                              className="
                                w-12
                                text-center
                                font-bold
                                text-lg
                              "
                            >
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                addToCart(item)
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                bg-orange-500
                                hover:bg-orange-600
                                text-white
                                font-bold
                                text-xl
                                cursor-pointer
                                transition
                              "
                            >
                              +
                            </button>

                          </div>

                        </div>

                        {/* SUBTOTAL */}

                        <div className="sm:text-right">

                          <p className="text-xs text-gray-400">
                            Subtotal
                          </p>

                          <p className="font-bold text-xl mt-1">
                            {(
                              Number(item.price) *
                              item.quantity
                            ).toFixed(2)} €
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </article>

              ))}

            </div>

            {/* =========================
                RESUMEN DEL PEDIDO
            ========================= */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                mt-6
                shadow-sm
              "
            >

              <h2 className="text-xl font-bold">
                Resumen del pedido
              </h2>

              <div className="mt-5 space-y-3">

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

                <div className="flex justify-between text-gray-500">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    {totalPrice.toFixed(2)} €
                  </span>

                </div>

              </div>

              <div
                className="
                  flex
                  justify-between
                  items-end
                  mt-5
                  pt-5
                  border-t
                  border-gray-200
                "
              >

                <div>

                  <p className="text-gray-500 text-sm">
                    Total
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    IVA incluido
                  </p>

                </div>

                <span className="text-3xl font-bold">
                  {totalPrice.toFixed(2)} €
                </span>

              </div>

              {/* CONTINUAR */}

              <button
                onClick={() => navigate('/checkout')}
                className="
                  w-full
                  mt-6
                  bg-orange-500
                  hover:bg-orange-600
                  text-white
                  py-4
                  rounded-xl
                  font-bold
                  text-lg
                  cursor-pointer
                  transition
                "
              >
                Continuar pedido →
              </button>

              {/* SEGUIR COMPRANDO */}

              <button
                onClick={() => navigate('/')}
                className="
                  w-full
                  mt-3
                  bg-gray-100
                  hover:bg-gray-200
                  text-gray-700
                  py-3
                  rounded-xl
                  font-semibold
                  cursor-pointer
                  transition
                "
              >
                + Añadir más productos
              </button>

            </div>

          </>

        )}

      </main>

    </div>
  )
}

export default Cart