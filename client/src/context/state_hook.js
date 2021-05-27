import { createContext, useContext } from 'react'

export const StateContext = createContext()

function useAppState(initialData = {}) {
  const context = useContext(StateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within a AppProvider')
  }
  return { ...initialData, ...context }
}

export default useAppState
