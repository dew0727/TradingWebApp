import useAppDispatch from "./dispatch_hook";
import useAppState from "./state_hook";

// Mapping queries
function useApp() {
  const appDispatch = useAppDispatch();

  const setServerStatus = (status) => {
    appDispatch({
      type: "SET_ORDER_STATUS",
      server_status: status,
    });
  };

  const setSoundStatus = (type) => {
    appDispatch({
      type: 'SET_SOUND',
      type: type,
    })

    setTimeout(() => {
      appDispatch({
        type: 'SET_SOUND',
        type: 'NONE'
      })
    }, 500)
  }

  const initialData = {
    server_status: "IDLE",
    soundType: 'NONE',
    setServerStatus,
    setSoundStatus,
  };

  const appState = useAppState(initialData);

  return [appState, appDispatch];
}

export default useApp;
