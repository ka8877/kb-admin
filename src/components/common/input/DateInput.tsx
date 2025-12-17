// frontend/src/components/common/input/DateInput.tsx
import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormHelperText, Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

// 한국어 로케일 설정
dayjs.locale('ko');

export interface DateInputProps {
  /** 라벨 텍스트 */
  label: string;
  /** 선택된 날짜/시간 값 */
  value: Dayjs | null;
  /** 날짜/시간 변경 핸들러 */
  onChange: (value: Dayjs | null) => void;
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  helperText?: string;
  /** 필수 필드 여부 */
  required?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 최소 날짜/시간 */
  minDate?: Dayjs;
  /** 최대 날짜/시간 */
  maxDate?: Dayjs;
  /** 날짜/시간 형식 */
  format?: string;
  /** DateTimePicker 크기 */
  size?: 'small' | 'medium';
  /** DateTimePicker variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** 이름 속성 */
  name?: string;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** placeholder 텍스트 */
  placeholder?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  minDate,
  maxDate,
  format = 'YYYY-MM-DD HH:mm',
  size = 'medium',
  variant = 'outlined',
  name,
  readOnly = false,
  placeholder = '날짜와 시간을 선택하세요',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const savedScrollRef = React.useRef<{
    scrollX: number;
    scrollY: number;
    containers: Array<{ element: HTMLElement; scrollLeft: number }>;
  } | null>(null);

  // 스크롤 위치 저장 함수
  const saveScrollPosition = React.useCallback(() => {
    // 페이지 스크롤 위치 저장
    const savedScrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || 0;
    const savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // 모든 스크롤 가능한 부모 컨테이너 찾기
    const scrollContainers: Array<{ element: HTMLElement; scrollLeft: number }> = [];

    if (containerRef.current) {
      let parent: HTMLElement | null = containerRef.current.parentElement;
      while (parent && parent !== document.body) {
        const hasScroll = parent.scrollWidth > parent.clientWidth || parent.scrollHeight > parent.clientHeight;
        if (hasScroll) {
          scrollContainers.push({
            element: parent,
            scrollLeft: parent.scrollLeft,
          });
        }
        parent = parent.parentElement;
      }
    }

    savedScrollRef.current = {
      scrollX: savedScrollX,
      scrollY: savedScrollY,
      containers: scrollContainers,
    };
  }, []);

  // 스크롤 위치 복원 함수
  const restoreScrollPosition = React.useCallback(() => {
    if (!savedScrollRef.current) return;

    const { scrollX, scrollY, containers } = savedScrollRef.current;

    // 페이지 스크롤 복원
    if (scrollX !== 0 || scrollY !== 0) {
      window.scrollTo(scrollX, scrollY);
    }

    // 모든 컨테이너 스크롤 복원
    containers.forEach(({ element, scrollLeft }) => {
      if (element && scrollLeft !== null && scrollLeft !== undefined) {
        element.scrollLeft = scrollLeft;
      }
    });
  }, []);

  const handleOpen = React.useCallback(() => {
    // 포털이 열릴 때 스크롤 위치 저장
    saveScrollPosition();
  }, [saveScrollPosition]);

  const handleAccept = React.useCallback(
    (newValue: Dayjs | null) => {
      // onChange 호출
      onChange(newValue);

      // 스크롤 위치 복원 (여러 프레임에 걸쳐 재시도)
      requestAnimationFrame(() => {
        restoreScrollPosition();
        requestAnimationFrame(() => {
          restoreScrollPosition();
          requestAnimationFrame(() => {
            restoreScrollPosition();
          });
        });
      });
    },
    [onChange, restoreScrollPosition],
  );

  const handleClose = React.useCallback(() => {
    // 포털이 닫힐 때 스크롤 위치 복원
    if (savedScrollRef.current) {
      requestAnimationFrame(() => {
        restoreScrollPosition();
        requestAnimationFrame(() => {
          restoreScrollPosition();
          requestAnimationFrame(() => {
            restoreScrollPosition();
          });
        });
      });
    }
  }, [restoreScrollPosition]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Box ref={containerRef} sx={{ width: fullWidth ? '100%' : 'auto' }}>
        <DateTimePicker
          label={label}
          value={value}
          onChange={onChange}
          onAccept={handleAccept}
          onOpen={handleOpen}
          onClose={handleClose}
          disabled={disabled}
          readOnly={readOnly}
          minDate={minDate}
          maxDate={maxDate}
          format={format}
          slotProps={{
            textField: {
              required,
              error,
              size,
              variant,
              name,
              fullWidth,
              placeholder,
            },
          }}
        />
        {helperText && (
          <FormHelperText error={error} sx={{ marginLeft: 1.75, marginTop: 0.5 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default DateInput;
