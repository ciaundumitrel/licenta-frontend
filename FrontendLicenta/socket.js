import { io } from 'socket.io-client';

export const socket = io('http://192.168.1.2:8000'); //	use the IP address of your machine