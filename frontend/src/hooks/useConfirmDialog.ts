import { create } from 'zustand';

export type ConfirmDialogState = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warning' | 'error';
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ConfirmDialogStore = ConfirmDialogState & {
  showConfirm: (config: Omit<ConfirmDialogState, 'open'>) => void;
  hideConfirm: () => void;
  confirm: () => void;
  cancel: () => void;
};

export const useConfirmDialogStore = create<ConfirmDialogStore>((set, get) => ({
  open: false,
  title: '확인',
  message: '정말로 확인하시겠습니까?',
  confirmText: '확인',
  cancelText: '취소',
  severity: 'warning',
  onConfirm: undefined,
  onCancel: undefined,

  showConfirm: (config) => {
    set({
      open: true,
      title: config.title ?? '확인',
      message: config.message ?? '정말로 확인하시겠습니까?',
      confirmText: config.confirmText ?? '확인',
      cancelText: config.cancelText ?? '취소',
      severity: config.severity ?? 'warning',
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
    });
  },

  hideConfirm: () => {
    set({ open: false });
  },

  confirm: async () => {
    const state = get();
    console.log('🔍 confirm 함수 호출됨, onConfirm 존재:', !!state.onConfirm);
    if (state.onConfirm) {
      console.log('🔍 onConfirm 실행 시작');
      try {
        const result = state.onConfirm();
        // onConfirm이 Promise를 반환하는 경우 처리
        if (result instanceof Promise) {
          await result;
        }
        console.log('🔍 onConfirm 실행 완료');
      } catch (error) {
        console.error('🔍 onConfirm 실행 중 에러:', error);
        throw error;
      }
    }
    set({ open: false });
  },

  cancel: () => {
    const state = get();
    if (state.onCancel) state.onCancel();
    set({ open: false });
  },
}));

export const useConfirmDialog = () => {
  const showConfirm = useConfirmDialogStore((state) => state.showConfirm);
  return { showConfirm };
};
