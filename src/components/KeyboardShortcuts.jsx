import { useEffect } from 'react';
import { useMusic } from '../context/MusicContext';

const KeyboardShortcuts = () => {
    const { togglePlay, handleNext, handlePrev, toggleMute, toggleShuffle, cycleRepeatMode, openEqualizer, openVolumeSuite, volume, setVolume } = useMusic();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleNext();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePrev();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    toggleShuffle();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    cycleRepeatMode();
                    break;
                case 'KeyE':
                    e.preventDefault();
                    openEqualizer();
                    break;
                case 'KeyV':
                    e.preventDefault();
                    openVolumeSuite();
                    break;
                case 'Equal':
                case 'NumpadAdd':
                    e.preventDefault();
                    setVolume(Math.min(1, volume + 0.1));
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    e.preventDefault();
                    setVolume(Math.max(0, volume - 0.1));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, handleNext, handlePrev, toggleMute, toggleShuffle, cycleRepeatMode, openEqualizer, openVolumeSuite, volume, setVolume]);

    return null;
};

export default KeyboardShortcuts;
