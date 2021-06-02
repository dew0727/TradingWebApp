import useSound from "use-sound";
import useAppDispatch from "./dispatch_hook";
import useAppState from "./state_hook";

// loading sounds
import buttonClickSfx0 from "../sounds/button_click_0.wav";
import buttonDisabledSfx1 from "../sounds/button_disabled_0.wav";
import alertSfx0 from "../sounds/sweetalert.wav";
import notificationSfx0 from '../sounds/notification-sound.mp3'

// Mapping queries
function useApp() {
  const [playButton0] = useSound(buttonClickSfx0);
  const [playDisableBtn] = useSound(buttonDisabledSfx1);
  const [playAlert] = useSound(alertSfx0);
  const [playNotification] = useSound(notificationSfx0)

  const appDispatch = useAppDispatch();

  const setServerStatus = (status) => {
    appDispatch({
      type: "SET_ORDER_STATUS",
      server_status: status,
    });
  };

  const playSound = (type) => {
    switch (type) {
      case "button": {
        playDisableBtn();
        break;
      }
      case "UPDATE_SETTING": {
        playButton0();
        break;
      }

      case "REQUEST_ORDER": {
        playAlert();
        break;
      }

      case 'NOTIFY':
      playNotification()
      break

      default:
        playButton0();
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
