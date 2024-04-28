import { Recorder, Types } from "expo-audio-streaming";
import { useState, useCallback, useEffect } from "react";

export const recorder = ({
  onNewBuffer,
} = {}) => {
  const [recording, setRecording] = useState(false);
  const [buffer, setBuffer] = useState([]);

  const start = useCallback(async () => {
    Recorder.start();
    setRecording(true);
  }, [setRecording]);

  const stop = useCallback(() => {
    Recorder.stop();
    setRecording(false);
  }, [setRecording]);

  const _onNewBuffer = useCallback(
    (event) => {
      setBuffer((prev) => [...prev, event.buffer]);
      onNewBuffer?.(event);
    },
    [onNewBuffer, setBuffer]
  );

  useEffect(() => {
    const onNewBufferListener = Recorder.addOnNewBufferListener(_onNewBuffer);

    return () => {
      onNewBufferListener.remove();
    };
  }, [_onNewBuffer]);

  return {
    start,
    stop,
    buffer,
    recording,
  };
};
