"use client";
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href={`/builder/${uuidv4()}`}>
        <Button>Create Workflow</Button>
      </Link>
    </div>
  );
}
