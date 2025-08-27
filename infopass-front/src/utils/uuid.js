/**
 * 브라우저 호환성을 위한 UUID 생성 함수
 * crypto.randomUUID()가 지원되지 않는 구형 브라우저를 위한 폴백
 */

// crypto.randomUUID()가 지원되는지 확인
const isCryptoRandomUUIDSupported = () => {
  return typeof crypto !== 'undefined' && 
         typeof crypto.randomUUID === 'function';
};

// 폴백 UUID 생성 함수 (v4 형식)
const generateFallbackUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 메인 UUID 생성 함수
export const generateUUID = () => {
  if (isCryptoRandomUUIDSupported()) {
    return crypto.randomUUID();
  } else {
    console.warn('crypto.randomUUID() not supported, using fallback UUID generator');
    return generateFallbackUUID();
  }
};

// 세션 ID 생성 (짧은 형식)
export const generateSessionId = () => {
  if (isCryptoRandomUUIDSupported()) {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  } else {
    return Math.random().toString(36).substring(2, 18);
  }
};

// 고유 ID 생성 (숫자 + 문자)
export const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};
