import React from 'react';
import Button from '@mui/material/Button';

type Props = {
  selectionMode: boolean;
  onToggleSelection: (next: boolean) => void;
  size?: 'small' | 'medium' | 'large';
};

const SelectionDeleteButton: React.FC<Props> = ({
  selectionMode,
  onToggleSelection,
  size = 'small',
}) => {
  return (
    <Button variant="outlined" size={size} onClick={() => onToggleSelection(!selectionMode)}>
      {selectionMode ? '삭제 취소' : '선택 삭제'}
    </Button>
  );
};

export default SelectionDeleteButton;
