'use client';

import Link from 'next/link';

export default function BlogsButton() {
  return (
    <Link
      href="/blogs"
      className="fixed right-0 z-40 group"
      style={{ top: 'calc(50% - 80px)' }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-l-lg shadow-md hover:shadow-lg transition-all duration-300"
        style={{
          backgroundColor: '#9B8BB4',
          width: '38px',
          padding: '10px 0',
        }}
      >
        <span className="text-sm" style={{ lineHeight: 1 }}>✦</span>
        <span
          className="text-white font-bold tracking-wider text-[11px]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '0.12em',
            padding: '8px 0',
          }}
        >
          Blogs
        </span>
        <span className="text-sm" style={{ lineHeight: 1 }}>✦</span>
      </div>
    </Link>
  );
}
