import React from 'react';
import Link from 'next/link';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { UserCheck, Twitter, Linkedin } from 'lucide-react';

interface AuthorBoxProps {
  author: {
    name: string;
    slug: string;
    bio?: string | null;
    avatar?: string | null;
    role?: string;
    twitter?: string | null;
    linkedin?: string | null;
  };
}

export function AuthorBox({ author }: AuthorBoxProps) {
  return (
    <section
      aria-label="Author Profile"
      className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl my-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 border-2 border-white shadow-sm">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-800 font-bold text-xl">
            {author.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-cyan-700" />
              Technology Editor & Hardware Analyst
            </span>
            <Link
              href={`/author/${author.slug}`}
              className="text-lg font-bold text-slate-900 hover:text-cyan-700 transition-colors"
            >
              {author.name}
            </Link>
            {author.role && (
              <span className="text-xs text-slate-500 block">{author.role}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-black rounded hover:bg-white transition-colors"
                aria-label={`Twitter ${author.name}`}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {author.linkedin && (
              <a
                href={`https://linkedin.com/in/${author.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-[#0A66C2] rounded hover:bg-white transition-colors"
                aria-label={`LinkedIn ${author.name}`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {author.bio && (
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {author.bio}
          </p>
        )}

        <div className="mt-3">
          <Link
            href={`/author/${author.slug}`}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 underline underline-offset-2"
          >
            View all articles and reviews by {author.name} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
