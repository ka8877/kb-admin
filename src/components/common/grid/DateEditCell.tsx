import React from 'react';
import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { DateView, TimeView } from '@mui/x-date-pickers';
import { formatDateForStorage } from '@/utils/dateUtils';

export type DateEditCellProps = {
  params: GridRenderEditCellParams;
  dateFormat: string;
};

const DateEditCell = React.memo<DateEditCellProps>(({ params, dateFormat }) => {
  const [open, setOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<dayjs.Dayjs | null>(
    params.value ? dayjs(params.value, dateFormat) : null,
  );
  const latestValueRef = React.useRef<dayjs.Dayjs | null>(tempValue); // 최신 값 추적용 ref
  const hasAcceptedRef = React.useRef(false); // 확인 버튼을 눌렀는지 추적
  const [view, setView] = React.useState<DateView | TimeView | 'meridiem'>('day'); // 현재 뷰 상태

  // 셀에 포커스가 오면 달력 자동 열기 (처음 한 번만)
  React.useEffect(() => {
    if (!hasAcceptedRef.current) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // params.value가 변경되면 tempValue도 업데이트 (외부에서 값이 변경된 경우)
  React.useEffect(() => {
    if (params.value) {
      const newValue = dayjs(params.value, dateFormat);
      if (!newValue.isSame(tempValue)) {
        setTempValue(newValue);
        latestValueRef.current = newValue;
      }
    } else {
      setTempValue(null);
      latestValueRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.value, dateFormat]);

  const handleDateChange = (value: unknown) => {
    // onChange는 임시 값만 업데이트 (피커는 닫지 않음)
    let newValue = value as dayjs.Dayjs | null;

    // 값이 없던 상태에서 새로 날짜를 선택하는 경우(day 뷰), 시간을 00:00:00으로 초기화
    if (!params.value && newValue && view === 'day') {
      newValue = newValue.startOf('day');
    }

    setTempValue(newValue);
    latestValueRef.current = newValue;
  };

  const handleAccept = (value: unknown) => {
    // 확인 버튼을 눌렀을 때만 최종 값 적용
    const newValue = value as dayjs.Dayjs | null;

    const dateObj = newValue ? newValue.toDate() : null;
    const formattedValue = formatDateForStorage(dateObj, dateFormat);

    // 가로 스크롤 위치 저장 (피커가 열리기 전의 위치)
    let savedScrollLeft: number | null = null;
    try {
      const gridElement = params.api.rootElementRef?.current;
      if (gridElement) {
        const scrollContainer = gridElement.querySelector(
          '.MuiDataGrid-virtualScroller',
        ) as HTMLElement;
        if (scrollContainer) {
          savedScrollLeft = scrollContainer.scrollLeft;
        }
      }
    } catch (error) {
      console.debug('Failed to get scroll position:', error);
    }

    hasAcceptedRef.current = true; // 확인했다는 플래그 설정
    setOpen(false); // 먼저 피커 닫기

    params.api.setEditCellValue({
      id: params.id,
      field: params.field,
      value: formattedValue,
    });

    // 셀 편집 모드 종료
    try {
      params.api.stopCellEditMode({
        id: params.id,
        field: params.field,
      });
    } catch (error) {
      console.debug('Cell not in edit mode:', error);
    }

    // 스크롤 위치 복원 (DOM 업데이트가 완료된 후 여러 번 시도)
    if (savedScrollLeft !== null) {
      const restoreScroll = () => {
        try {
          const gridElement = params.api.rootElementRef?.current;
          if (gridElement) {
            const scrollContainer = gridElement.querySelector(
              '.MuiDataGrid-virtualScroller',
            ) as HTMLElement;
            if (scrollContainer && scrollContainer.scrollLeft !== savedScrollLeft) {
              scrollContainer.scrollLeft = savedScrollLeft!;
            }
          }
        } catch (error) {
          console.debug('Failed to restore scroll position:', error);
        }
      };

      // 여러 프레임에 걸쳐 복원 시도 (DataGrid 리렌더링 완료 대기)
      requestAnimationFrame(() => {
        restoreScroll();
        requestAnimationFrame(() => {
          restoreScroll();
          requestAnimationFrame(() => {
            restoreScroll();
            // 한 번 더 확실하게
            setTimeout(() => {
              restoreScroll();
            }, 50);
          });
        });
      });
    }
  };

  const handleClose = () => {
    // 닫힐 때는 단순히 닫기만 (임시 값은 자동으로 원래 값으로 복원됨)
    setOpen(false);
    // 임시 값을 원래 값으로 복원
    const originalValue = params.value ? dayjs(params.value, dateFormat) : null;
    setTempValue(originalValue);
    latestValueRef.current = originalValue;
  };

  const currentValue = tempValue;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <DateTimePicker
        value={currentValue}
        onChange={handleDateChange}
        onAccept={handleAccept}
        open={open}
        onOpen={() => {
          if (!hasAcceptedRef.current) {
            setOpen(true);
          }
        }}
        onClose={handleClose}
        format="YYYY-MM-DD hh:mm a"
        views={['year', 'day', 'hours', 'minutes', 'meridiem'] as any}
        view={view}
        onViewChange={(newView) => setView(newView as DateView | TimeView | 'meridiem')}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            autoFocus: true,
            onKeyDown: (e: React.KeyboardEvent) => {
              // Tab 키는 상위에서 처리하도록 전파
              if (e.key === 'Tab') {
                e.stopPropagation();
              }
              // Enter 키를 누르면
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (open) {
                  // MUI 내부 상태 업데이트를 기다림
                  setTimeout(() => {
                    handleAccept(latestValueRef.current);
                  }, 0);
                } else if (!hasAcceptedRef.current) {
                  setOpen(true);
                }
              }
            },
          },
          // 팝업(달력) 내부에서의 키 이벤트 처리
          popper: {
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.stopPropagation(); // DataGrid로 전파 방지

                // 마지막 단계(오전/오후 선택)인 경우에만 저장 및 닫기
                if (view === 'meridiem') {
                  // MUI 내부 상태 업데이트(onChange 호출)를 기다리기 위해 지연 실행
                  setTimeout(() => {
                    handleAccept(latestValueRef.current);
                  }, 0);
                }
                // 그 외의 경우(날짜, 시간 선택 등)는 MUI 기본 동작(다음 단계로 이동)을 따름
              }
            },
          },
        }}
      />
    </LocalizationProvider>
  );
});

export default DateEditCell;
