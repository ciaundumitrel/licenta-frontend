import { io } from 'socket.io-client';
import * as FileSystem from "expo-file-system";

export const socket = io('http://192.168.1.2:8000'); // use the IP address of your machine


const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


export async function uploadChunksToServer(recordingInstance, chunkSize, delayBetweenChunks) {
  console.log('calling sending');

  let info = await FileSystem.getInfoAsync(recordingInstance.getURI());
  let uri = info.uri;
  let currentPosition = 0;
  await sleep(5000);
  let current_file_size = info.size;
  let prev_pos = 0;

  do{

    try{

      let info = await FileSystem.getInfoAsync(recordingInstance.getURI());
      current_file_size = info.size;

        if (currentPosition + 24 >= current_file_size &&  currentPosition === prev_pos && prev_pos !== 0){
          console.log('blocked')
          continue;

        }
        else{
          console.log(currentPosition, current_file_size);
          const fileChunk = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
              position: currentPosition,
              length: 24
            })
            currentPosition += 24;
            socket.emit('audioData', fileChunk);
          }
          prev_pos = currentPosition;


    }
    catch (e) {
      console.log(e);
    }
    if (recordingInstance._isDoneRecording && current_file_size - currentPosition < 24){
          const fileChunk = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
          position: currentPosition,
          length: current_file_size - currentPosition
        })
        currentPosition += current_file_size - currentPosition;
        socket.emit('audioData', fileChunk);
        break
      }
  }


  while(currentPosition < current_file_size)
  console.log("final report >> ", currentPosition, current_file_size)
  console.log('exiting')

   const fileChunk = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  socket.emit('data', fileChunk);

}




    //
    // try {
    //   const fileChunk = await FileSystem.readAsStringAsync(uri, {
    //     encoding: FileSystem.EncodingType.Base64,
    //     position: startPosition,
    //     length: length
    //   });
    //
    //   // Send the file chunk to the server or emit it via socket
    //   socket.emit('audioData', fileChunk);
    //   console.log(startPosition, fileSize);
    //   console.log(fileChunk);
    //
    //   // Introduce delay between chunks (if needed)
    //   await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
    //
    // } catch (error) {
    //   console.error('Error reading or uploading chunk:', error);
    //   // Handle error as needed (e.g., retry, notify user)
    // }
    //
    // startPosition = endPosition;
