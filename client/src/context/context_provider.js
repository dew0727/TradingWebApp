import React, { useReducer } from "react";

import { DispatchContext } from "./dispatch_hook";

import reducer, { initialState } from "./reducer";

import { StateContext } from "./state_hook";

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(
    reducer,
    Object.assign(initialState, {})
  );

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export default AppProvider;
