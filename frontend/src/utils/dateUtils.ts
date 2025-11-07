// frontend/src/utils/dateUtils.ts

/**
 * 다양한 날짜 형식을 표준화하는 유틸리티 함수들
 */

export type DateInputFormat =
  | string // '2025-12-12 15:00:00' or '20251212150000'
  | Date // Date 객체
  | null;

/**
 * 날짜 문자열을 ISO 8601 형식으로 변환
 * @param dateInput - 다양한 형식의 날짜 입력
 * @returns ISO 8601 형식 문자열 (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export const toISOString = (dateInput: DateInputFormat): string | null => {
  if (!dateInput) return null;

  let dateObj: Date;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    const dateStr = String(dateInput).trim();

    // YYYYMMDDHHMMSS 형식 (20251212150000)
    if (/^\d{14}$/.test(dateStr)) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(8, 10);
      const minute = dateStr.substring(10, 12);
      const second = dateStr.substring(12, 14);
      dateObj = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    }
    // YYYY-MM-DD HH:mm 형식
    else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateStr)) {
      dateObj = new Date(`${dateStr}:00`);
    }
    // YYYY-MM-DD HH:mm:ss 형식
    else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      dateObj = new Date(dateStr.replace(' ', 'T'));
    }
    // ISO 8601 또는 기타 Date 생성자가 이해할 수 있는 형식
    else {
      dateObj = new Date(dateStr);
    }
  }

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date input:', dateInput);
    return null;
  }

  return dateObj.toISOString();
};

/**
 * 날짜를 백엔드 전송용 형식으로 변환
 * 프로젝트 요구사항에 따라 이 함수를 수정하세요
 */
export const toBackendFormat = (dateInput: DateInputFormat): string | null => {
  // ISO 8601 형식으로 전송하는 경우
  return toISOString(dateInput);

  // 또는 YYYYMMDDHHMMSS 형식을 유지하려면:
  // return toCompactFormat(dateInput);
};

/**
 * 날짜를 YYYYMMDDHHMMSS 형식으로 변환 (기존 형식 유지용)
 */
export const toCompactFormat = (dateInput: DateInputFormat): string | null => {
  if (!dateInput) return null;

  let dateObj: Date;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    const dateStr = String(dateInput).trim();

    // 이미 YYYYMMDDHHMMSS 형식이면 그대로 반환
    if (/^\d{14}$/.test(dateStr)) {
      return dateStr;
    }

    // 다른 형식들을 Date 객체로 변환
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateStr)) {
      dateObj = new Date(`${dateStr}:00`);
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      dateObj = new Date(dateStr.replace(' ', 'T'));
    } else {
      dateObj = new Date(dateStr);
    }
  }

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date input:', dateInput);
    return null;
  }

  // YYYYMMDDHHMMSS 형식으로 포맷팅
  const year = dateObj.getFullYear().toString();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hour = dateObj.getHours().toString().padStart(2, '0');
  const minute = dateObj.getMinutes().toString().padStart(2, '0');
  const second = dateObj.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
};

/**
 * 날짜를 사용자 친화적인 형식으로 변환 (YYYY-MM-DD HH:mm:ss)
 */
export const toReadableFormat = (dateInput: DateInputFormat): string | null => {
  if (!dateInput) return null;

  let dateObj: Date;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    const dateStr = String(dateInput).trim();

    // YYYYMMDDHHMMSS 형식
    if (/^\d{14}$/.test(dateStr)) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(8, 10);
      const minute = dateStr.substring(10, 12);
      const second = dateStr.substring(12, 14);
      dateObj = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    }
    // 이미 YYYY-MM-DD HH:mm:ss 형식이면 그대로 반환
    else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      return dateStr;
    } else {
      dateObj = new Date(dateStr);
    }
  }

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date input:', dateInput);
    return null;
  }

  const year = dateObj.getFullYear().toString();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hour = dateObj.getHours().toString().padStart(2, '0');
  const minute = dateObj.getMinutes().toString().padStart(2, '0');
  const second = dateObj.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * 날짜 유효성 검증
 */
export const isValidDate = (dateInput: DateInputFormat): boolean => {
  if (!dateInput) return false;

  try {
    const isoString = toISOString(dateInput);
    return isoString !== null;
  } catch {
    return false;
  }
};

// 사용 예시:
// const userInput = '2025-12-12 15:00:00';
// const backendData = toBackendFormat(userInput); // "2025-12-12T15:00:00.000Z"
// const compactData = toCompactFormat(userInput); // "20251212150000"
// const readableData = toReadableFormat('20251212150000'); // "2025-12-12 15:00:00"
