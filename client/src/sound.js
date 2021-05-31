import useSound from 'use-sound'
import { useApp } from "./context";
import computerBoop from './sounds/computer-boop.wav'

const SoundPlayer = () => {

    const [appState] = useApp();
    const { server_status, setServerStatus } = appState;

    const [btnSound] = useSound(computerBoop)

    const {soundType} = server_status

    switch(soundType) {
        case 'ON_CLICK': {
            btnSound()
            break
        }

        default:
            btnSound()
    }

    return <></>
}

export default SoundPlayer;