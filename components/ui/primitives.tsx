import Link from "next/link";
import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const isExternal = (href: string) => /^(https?:)?\/\//.test(href);
const isSpecial = (href: string) => /^(mailto:|tel:|#)/.test(href);

type SmartLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

/** Next <Link> for in-app routes, plain <a> for absolute, mailto and hash links. */
export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (isExternal(href) || isSpecial(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={cx("mx-auto w-full max-w-[1280px] px-5 md:px-8", className)}>
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-gray-600 inverted:text-gray-500",
        className,
      )}
    >
      {children}
    </p>
  );
}

type Variant = "primary" | "secondary" | "glow";

const base =
  "group inline-flex h-12 whitespace-nowrap items-center justify-center gap-2 border px-6 text-sm font-medium tracking-[-0.01em] transition-colors duration-300 ease-out-quart";

const variants: Record<Variant, string> = {
  primary:
    "border-black bg-black text-white hover:bg-white hover:text-black inverted:border-white inverted:bg-white inverted:text-black inverted:hover:bg-black inverted:hover:text-white",
  secondary:
    "border-black bg-transparent text-black hover:bg-black hover:text-white inverted:border-line inverted:bg-transparent inverted:text-white inverted:backdrop-blur inverted:hover:border-white inverted:hover:bg-white/10",
  glow:
    "border-white bg-white text-ink hover:bg-ink hover:text-white",
};

export function ButtonLink({
  href,
  variant = "primary",
  arrow = true,
  className,
  children,
  ...rest
}: SmartLinkProps & { variant?: Variant; arrow?: boolean }) {
  const Icon = isExternal(href) ? ArrowUpRight : ArrowRight;
  return (
    <SmartLink href={href} className={cx(base, variants[variant], className)} {...rest}>
      {children}
      {arrow && (
        <Icon
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-out-quart group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      )}
    </SmartLink>
  );
}

/** Underlined text link with an arrow, used for inline CTAs. */
export function TextLink({
  href,
  children,
  className,
  ...rest
}: SmartLinkProps) {
  return (
    <SmartLink
      href={href}
      className={cx(
        "group inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-medium tracking-[-0.01em]",
        className,
      )}
      {...rest}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform duration-300 ease-out-quart group-hover:translate-x-1"
        strokeWidth={1.5}
      />
    </SmartLink>
  );
}

/** Section wrapper with a hairline top rule and an editorial index label. */
export function Section({
  id,
  index,
  label,
  children,
  tone = "light",
  className,
  labelledBy,
}: {
  id?: string;
  index?: string;
  label?: string;
  children: ReactNode;
  tone?: "light" | "inverted" | "dark";
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-tone={tone !== "light" ? "inverted" : undefined}
      className={cx(
        "relative border-t",
        tone === "inverted" && "border-gray-800 bg-black text-white",
        tone === "dark" && "border-line bg-ink text-white",
        tone === "light" && "border-gray-200 bg-white text-black",
        className,
      )}
    >
      <Container className="py-24 md:py-36">
        {(index || label) && (
          <div className="mb-14 flex items-center gap-4 md:mb-20">
            {index && (
              <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-gray-500">
                {index}
              </span>
            )}
            {label && <Eyebrow>{label}</Eyebrow>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

/** Small bordered label, e.g. "Planned" or "Demo data". */
export function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center border border-current px-2 py-[3px] font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.14em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
