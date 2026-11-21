import { redirect } from 'next/navigation';

// The old multi-step agent flow is retired — listing an agent is one form now.
export default function RegisterAgentPage() {
  redirect('/register/service');
}
