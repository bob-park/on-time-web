import { useContext } from 'react';

import { ToastContext } from '@/shared/components/toast/ToastProvider';

export default function useToast() {
  const { push } = useContext(ToastContext);

  return { push };
}
