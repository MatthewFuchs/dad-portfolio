import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  meta?: ReactNode;
  cue: string;
  image: { src: string; alt: string; fit?: "cover" | "contain"; bg?: string };
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  /** Navigates when given; otherwise pass onClick (e.g. to open a dialog). */
  href?: string;
  onClick?: () => void;
  testId?: string;
};

// The one tappable card used across the site: picture, title, one line of
// detail and an explicit cue ("View project →"). The whole card is the target.
export default function Card({
  title,
  meta,
  cue,
  image,
  ratio = "aspect-[3/2]",
  sizes = "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",
  priority,
  href,
  onClick,
  testId,
}: Props) {
  const contain = image.fit === "contain";
  const body = (
    <>
      <span
        className={`relative block overflow-hidden ${ratio} ${
          image.bg ?? (contain ? "bg-white" : "bg-surface")
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:scale-[1.03] ${
            contain ? "object-contain p-6" : "object-cover"
          }`}
        />
      </span>
      <span className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="block text-[length:var(--text-lead)] leading-tight tracking-[-0.02em]">
          {title}
        </span>
        {meta && (
          <span className="mt-1.5 line-clamp-2 text-[length:var(--text-small)] text-soft">
            {meta}
          </span>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-2 font-medium">
          {cue}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </span>
    </>
  );

  const cls =
    "group flex h-full w-full flex-col bg-white text-left text-ink transition-transform duration-200 active:scale-[0.99]";

  return href ? (
    <Link href={href} className={cls} data-testid={testId}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} data-testid={testId}>
      {body}
    </button>
  );
}
