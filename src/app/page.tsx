import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');

  return <div className="">main page 이다</div>;
}
