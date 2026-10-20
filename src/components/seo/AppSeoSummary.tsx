import type { AppId } from "@/lib/app-host";
import { APP_SEO, buildAppJsonLd, PORTFOLIO_URL, serializeJsonLd } from "@/lib/seo";

interface AppSeoSummaryProps {
  app: AppId;
  /** Titles and descriptions of the works the shell displays. */
  works: { title: string; description?: string | null }[];
  /** schema.org nodes describing the same works. */
  jsonLd: object[];
}

/**
 * Server-rendered text for crawlers and screen readers: the Adobe shell is
 * client-rendered and shows each work in panels, so without this the initial
 * HTML has no heading and no link back to the portfolio. `sr-only`, not
 * hidden: the same content is reachable in the UI. The link is out of the tab
 * order since it is invisible.
 */
export function AppSeoSummary({ app, works, jsonLd }: AppSeoSummaryProps) {
  const { title, description } = APP_SEO[app];
  return (
    <div className="sr-only">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildAppJsonLd(app, jsonLd)) }}
      />
      <h1>{title}</h1>
      <p>{description}</p>
      {works.length > 0 && (
        <ul>
          {works.map((work) => (
            <li key={work.title}>
              {work.title}
              {work.description ? `: ${work.description}` : ""}
            </li>
          ))}
        </ul>
      )}
      <p>
        Projet du{" "}
        <a href={PORTFOLIO_URL} tabIndex={-1}>
          portfolio d&apos;Elwen
        </a>
        .
      </p>
    </div>
  );
}
