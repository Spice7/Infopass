/**
 * 간단한 console 래퍼
 * main.jsx에서 전역 console 제어를 하므로, 여기서는 단순히 console로 연결
 */

export const devLog = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  info: (...args) => console.info(...args),
  debug: (...args) => console.debug(...args),
  table: (...args) => console.table(...args)
};

export default devLog;
