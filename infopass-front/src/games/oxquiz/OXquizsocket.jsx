import { io } from 'socket.io-client';

import { WS_BASE_URL } from '../../config/api';

const socket = io(WS_BASE_URL, {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;