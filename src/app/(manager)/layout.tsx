import { forbidden } from 'next/navigation';

import { RoleType } from '@/domain/users/apis/users.dto';
import { getUserinfo } from '@/shared/auth/serverAction';
import { hasRole } from '@/utils/AuthUtils';

export default async function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserinfo();

  if (!user || !hasRole(user.role as RoleType, 'ROLE_MANAGER')) {
    forbidden();
  }

  return <>{children}</>;
}
