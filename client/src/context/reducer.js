export const initialState = {
    server_status: 'IDLE'
  }
  
  function reducer(state = initialState, action = {}) {
    switch (action.type) {
      case 'SET_ORDER_STATUS': {
        return {
          ...state,
          server_status: action.server_status,
        }
      }
  
      default: {
        throw new Error(`Unhandled action type: ${action.type}`)
      }
    }
  }
  
  export default reducer
  