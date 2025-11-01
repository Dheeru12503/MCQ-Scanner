import { redirect } from 'next/navigation';

export default function Home() {
  // TEMPORARILY REDIRECTING TO DASHBOARD FOR TESTING (auth disabled)
  redirect('/dashboard');
}
