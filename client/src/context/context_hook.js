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

  const initialData = {
    server_status: "IDLE",
    setServerStatus,
  };

  const appState = useAppState(initialData);

  return [appState, appDispatch];
}

export default useApp;
