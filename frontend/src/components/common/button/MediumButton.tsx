import React from 'react';
import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';
import { useButtonPermission } from '@/hooks/usePermission';
import type { UserAction } from '@/types/types';

export type MediumButtonProps = ButtonProps & {
  /**
   * 사용자 액션 유형
   * c: 등록
   * d: 삭제
   * u: 수정
   * etc: 기타
   * manage: 관리
   */
  subType: UserAction;
};

const MediumButton: React.FC<MediumButtonProps> = ({ children, sx, subType, ...props }) => {
  const { isAllowed } = useButtonPermission(subType);

  if (!isAllowed) {
    return null;
  }

  const mediumButtonStyles = {
    fontSize: '0.875rem',
    padding: '6px 12px',
    minWidth: '90px',
    ...sx, // 기존 sx를 덮어쓸 수 있도록
  };

  return (
    <Button sx={mediumButtonStyles} {...props}>
      {children}
    </Button>
  );
};

export default MediumButton;
