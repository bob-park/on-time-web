import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();

  const lastPage = cookieStore.get('lastPage');

  redirect(lastPage ? lastPage.value : '/dashboard');

  return <div className=""></div>;
}
