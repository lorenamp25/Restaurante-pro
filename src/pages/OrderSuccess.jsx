import { useNavigate, useParams } from 'react-router-dom'

function OrderSuccess() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

      <div className="bg-white max-w-lg w-full rounded-3xl shadow-sm overflow-hidden">

        {/* FRANJA SUPERIOR */}

        <div className="h-2 bg-green-500" />

        <div className="p-8 sm:p-10 text-center">

          {/* ICONO */}

          <div
            className="
              w-24
              h-24
              bg-green-100
              text-green-600
              rounded-full
              flex
              items-center
              justify-center
              text-5xl
              mx-auto
            "
          >
            ✓
          </div>

          {/* MENSAJE */}

          <p className="text-green-600 font-bold text-sm mt-6">
            PEDIDO CONFIRMADO
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mt-2">
            ¡Pedido enviado!
          </h1>

          <p className="text-gray-500 mt-3 leading-relaxed">
            Hemos recibido correctamente tu pedido y ya ha sido enviado a cocina.
          </p>

          {/* NÚMERO DE PEDIDO */}

          <div className="bg-gray-100 rounded-2xl p-6 mt-8">

            <p className="text-gray-500 text-sm">
              Número de pedido
            </p>

            <p className="text-4xl font-bold mt-2">
              #{id}
            </p>

            <p className="text-gray-400 text-xs mt-2">
              Guarda este número como referencia.
            </p>

          </div>

          {/* ESTADO */}

          <div className="flex items-center justify-center gap-3 mt-7">

            <div
              className="
                w-10
                h-10
                bg-orange-100
                rounded-full
                flex
                items-center
                justify-center
              "
            >
              👨‍🍳
            </div>

            <div className="text-left">

              <p className="font-bold">
                Pedido recibido
              </p>

              <p className="text-gray-500 text-sm">
                Cocina ya puede empezar a prepararlo.
              </p>

            </div>

          </div>

          {/* INFORMACIÓN */}

          <div
            className="
              bg-orange-50
              border
              border-orange-100
              rounded-2xl
              p-4
              mt-7
              text-left
            "
          >
            <p className="text-sm text-orange-800">
              🍽️ Tu pedido irá cambiando de estado en cocina hasta que esté listo para servir.
            </p>
          </div>

          {/* VOLVER */}

          <button
            onClick={() => navigate('/')}
            className="
              w-full
              mt-8
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
            Volver a la carta
          </button>

          <p className="text-gray-400 text-xs mt-4">
            Gracias por tu pedido
          </p>

        </div>

      </div>

    </div>
  )
}

export default OrderSuccess