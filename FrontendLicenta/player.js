import { Player } from "expo-audio-streaming";
import { useState, useCallback, useEffect } from "react";

export const player = ({
  onBufferEmpty,
} = {}) => {
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    Player.play();
    setPlaying(true);
  }, [setPlaying]);

  const pause = useCallback(() => {
    Player.pause();
    setPlaying(false);
  }, [setPlaying]);

  const _onBufferEmpty = useCallback(() => {
    setPlaying(false);
    onBufferEmpty?.();
  }, [setPlaying]);

  const onBufferPlayed = useCallback((event) => {
    return event;
  }, []);

  const addToBuffer = useCallback((base64) => {
    Player.addToQueue(base64);
  }, []);

  useEffect(() => {
    const onBufferEmptyListener =
      Player.addOnBufferEmptyListener(_onBufferEmpty);
    const onBufferPlayedListener =
      Player.addOnBufferPlayedListener(onBufferPlayed);
    return () => {
      onBufferEmptyListener.remove();
      onBufferPlayedListener.remove();
    };
  }, [_onBufferEmpty, onBufferPlayed]);

  return {
    play,
    pause,
    addToBuffer,
    resetBuffer: Player.resetBuffer,

    playing,
  };
};
