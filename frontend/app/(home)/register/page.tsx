import { redirect } from 'next/navigation';

// /register goes straight to the list-your-agent form.
export default function RegisterPage() {
  redirect('/register/service');
}
