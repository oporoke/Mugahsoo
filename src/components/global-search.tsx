
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef } from 'react';

export function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get('query');

  // Sync input with URL query param
  useEffect(() => {
    if (inputRef.current && query) {
        inputRef.current.value = query;
    }
  }, [query]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('query') as string;
    if (searchQuery) {
      router.push(`/dashboard/search?query=${searchQuery}`);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          name="query"
          type="search"
          placeholder="Search members, transactions, requests..."
          className="w-full appearance-none bg-card pl-8 shadow-none md:w-2/3 lg:w-1/3"
          defaultValue={query ?? ''}
        />
      </div>
    </form>
  );
}
