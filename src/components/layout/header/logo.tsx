import Link from "next/link";

export const HeaderLogo = () => (
  <Link href="/" className="flex items-center gap-2">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-header-button-primary">
      <svg className="h-6 w-6 text-header-button-primary-text" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
        />
      </svg>
    </div>
    <span className="font-brand text-xl font-bold uppercase text-header-nav-text lg:text-2xl">
      JETT
    </span>
  </Link>
);
