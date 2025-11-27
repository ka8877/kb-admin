import React from 'react';
import type { GridRenderEditCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDateForStorage } from '@/utils/dateUtils';

type DateEditCellProps = {
  params: GridRenderEditCellParams;
  dateFormat: string;
};

const DateEditCell = React.memo<DateEditCellProps>(({ params, dateFormat }) => {
  const [open, setOpen] = React.useState(false);

  // 셀에 포커스가 오면 달력 자동 열기
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    const dateObj = newValue ? newValue.toDate() : null;
    const formattedValue = formatDateForStorage(dateObj, dateFormat);
    params.api.setEditCellValue({
      id: params.id,
      field: params.field,
      value: formattedValue,
    });
  };

  const currentValue = params.value ? dayjs(params.value, dateFormat) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        value={currentValue}
        onChange={handleDateChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        format="YYYY-MM-DD HH:mm"
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            onKeyDown: (e: React.KeyboardEvent) => {
              // Tab 키는 상위에서 처리하도록 전파
              if (e.key === 'Tab') {
                e.stopPropagation();
              }
              // Enter 키를 누르면 달력 열기
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }
            },
          },
        }}
      />
    </LocalizationProvider>
  );
});

DateEditCell.displayName = 'DateEditCell';

export default DateEditCell;

