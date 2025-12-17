import { useCallback, useState } from 'react';

/**
 * useDisclosure
 * 간단한 열림/닫힘 상태 관리를 위한 커스텀 훅입니다.
 * - 모달/다이얼로그/드로어/팝오버 등의 open 상태를 제어할 때 사용하세요.
 *
 * 사용 예시:
 * const { open, onOpen, onClose, onToggle } = useDisclosure({ defaultOpen: false })
 *
 * <Button onClick={onOpen}>열기</Button>
 * <Dialog open={open} onClose={onClose}>...</Dialog>
 */
export type UseDisclosureOptions = {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type UseDisclosureReturn = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  setOpen: (next: boolean) => void;
};

export const useDisclosure = (options?: UseDisclosureOptions): UseDisclosureReturn => {
  const [openState, _setOpenState] = useState<boolean>(options?.defaultOpen ?? false);

  const setOpen = useCallback(
    (next: boolean) => {
      _setOpenState(next);
      options?.onOpenChange?.(next);
    },
    [options?.onOpenChange],
  );

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen(!openState), [openState, setOpen]);

  return {
    open: openState,
    onOpen,
    onClose,
    onToggle,
    setOpen,
  };
};
