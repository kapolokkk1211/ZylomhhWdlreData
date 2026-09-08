import { redirect } from 'next/navigation';
import { DEFAULT_LANG } from '@/lib/ui';

export default function Root() {
  redirect(`/${DEFAULT_LANG}`);
}
