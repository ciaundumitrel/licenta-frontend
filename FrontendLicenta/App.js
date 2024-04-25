import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import { io } from 'socket.io-client';
import * as FileSystem from 'expo-file-system';
import { socket } from './socket';

const URL = 'http://192.168.1.2:8000/';



export default function App() {
  const [recording, setRecording] = React.useState();
  const [recordings, setRecordings] = React.useState([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [prevLen, setPrevLen] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');


  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const convertMP4ToBase64 = async (uri) => {
  try {
    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Return base64 encoded content
    return fileContent;
  } catch (error) {
    console.error('Error converting MP4 to base64:', error);
    return null;
  }
};
  async function startRecording() {
    let p_len = 0;
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
        const recordingInstance = new Audio.Recording();
        await recordingInstance.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        setRecording(recordingInstance);

        recordingInstance.setOnRecordingStatusUpdate(async (status) => {
        // const base64 = await recordingInstance.getBase64Async();
        // console.log(base64);

        const duration = status.durationMillis / 1000;
        const info = await FileSystem.getInfoAsync(recordingInstance.getURI());
        const uri = info.uri;
        // console.log(uri);
        convertMP4ToBase64(uri)
          .then((fileContent) => {
            if (fileContent) {
              // console.log('File content:', fileContent);
              const currLen = parseInt(info.size);
              console.log(p_len, currLen);
              console.log(fileContent.slice(prevLen, currLen));
              socket.emit('audioData', fileContent.slice(prevLen, currLen));
              p_len  = currLen;
              // Now you can use the file content as needed
            } else {
              console.log('Conversion failed.');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });


        // console.log(`Recording Status: ${status.isRecording}, Duration: ${duration}, Meterring: ${status.metering}, Uri: ${uri}`)
        // if(duration >10 && duration - prevDuration > 0){
        //       sendBlob(uri);
        //   }
        //  setPrevDuration(duration);
        });

        await recordingInstance.startAsync();
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setPrevLen(0);
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      let allRecordings = [...recordings];
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      allRecordings.push({
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: recording.getURI()
      });
      setRecordings(allRecordings);
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setRecording(undefined);
    }
  }

  function getDurationFormatted(milliseconds) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`;
  }

  function toggleRecording() {
    setIsRecording(prevState => !prevState);
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            Recording #{index + 1} | {recordingLine.duration}
          </Text>
          <Button onPress={() => recordingLine.sound.replayAsync()} title="Play"></Button>
          <Button title="Send Recording to Backend"/>
        </View>
      );
    });
  }

  function clearRecordings() {
    setRecordings([]);
  }

  return (
    <View style={styles.container}>
      <Button title={recording ? 'Stop Recording' : 'Start Recording\n\n\n'} onPress={recording ? stopRecording : startRecording} />
      {getRecordingLines()}
      <Button title={recordings.length > 0 ? 'Clear Recordings' : ''} onPress={clearRecordings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 40
  },
  fill: {
    flex: 1,
    margin: 15
  }
});
