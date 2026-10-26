import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {

  const [cart, setCart] = useState([])

  function addToCart(product) {

    setCart((currentCart) => {

      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      )

      if (existingProduct) {

        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1
        }
      ]
    })
  }

  function removeFromCart(productId) {

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function deleteFromCart(productId) {

    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== productId
      )
    )
  }

  function clearCart() {
    setCart([])
  }

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const totalPrice = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  )

  return (

    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>

  )
}

export function useCart() {
  return useContext(CartContext)
}