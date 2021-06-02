import useSound from "use-sound";
import useAppDispatch from "./dispatch_hook";
import useAppState from "./state_hook";

// loading sounds
import successSfx from "../sounds/success.wav";
import failedSfx from "../sounds/failed.wav";

// Mapping queries
function useApp() {
  const [playSuccess] = useSound(successSfx);
  const [playFailed] = useSound(failedSfx);

  const appDispatch = useAppDispatch();

  const setServerStatus = (status) => {
    appDispatch({
      type: "SET_ORDER_STATUS",
      server_status: status,
    });
  };

  const playSound = (type) => {
    switch (type) {
      case "ERROR":
        playFailed();
        break;

      default:
        playSuccess();
    }
  };

  const initialData = {
    server_status: "IDLE",
    playSound,
    setServerStatus,
  };

  const appState = useAppState(initialData);

  return [appState, appDispatch];
}

export default useApp;
