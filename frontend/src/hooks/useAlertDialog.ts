// frontend/src/hooks/useAlertDialog.ts
import { create } from 'zustand';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  severity: AlertSeverity;
  confirmText: string;
  onConfirm?: () => void;
}

interface AlertDialogStore extends AlertDialogState {
  showAlert: (props: {
    title?: string;
    message: string;
    severity?: AlertSeverity;
    confirmText?: string;
    onConfirm?: () => void;
  }) => void;
  hideAlert: () => void;
  confirm: () => void;
}

export const useAlertDialog = create<AlertDialogStore>((set, get) => ({
  // 초기 상태
  isOpen: false,
  title: '알림',
  message: '',
  severity: 'info',
  confirmText: '확인',
  onConfirm: undefined,

  // 알림창 표시
  showAlert: ({ title = '알림', message, severity = 'info', confirmText = '확인', onConfirm }) => {
    set({
      isOpen: true,
      title,
      message,
      severity,
      confirmText,
      onConfirm,
    });
  },

  // 알림창 숨김
  hideAlert: () => {
    set({
      isOpen: false,
      title: '알림',
      message: '',
      severity: 'info',
      confirmText: '확인',
      onConfirm: undefined,
    });
  },

  // 확인 버튼 클릭
  confirm: () => {
    const { onConfirm, hideAlert } = get();
    hideAlert();
    if (onConfirm) {
      onConfirm();
    }
  },
}));
