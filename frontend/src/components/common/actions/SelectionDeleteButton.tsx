import React from 'react';
import MediumButton from '../button/MediumButton';

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
    <MediumButton variant="outlined" size={size} onClick={() => onToggleSelection(!selectionMode)}>
      {selectionMode ? '삭제 취소' : '선택 삭제'}
    </MediumButton>
  );
};

export default SelectionDeleteButton;
