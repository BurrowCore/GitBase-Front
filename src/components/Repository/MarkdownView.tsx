import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  /** Raw markdown source (untrusted — it comes from repository content). */
  source: string;
}

/**
 * Renders markdown for README files and other `.md` blobs.
 *
 * Security: `react-markdown` does not render raw HTML unless the `rehype-raw` plugin is added —
 * it is deliberately NOT added here, so any HTML embedded in a repository's markdown is escaped
 * to text instead of executing. Links are forced to `noopener noreferrer`.
 */
export function MarkdownView({ source }: MarkdownViewProps) {
  return (
    <div
      className="
        text-sm text-gitbase-text-primary leading-relaxed
        [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3
        [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-gitbase-border-dark/30
        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3
        [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-gitbase-border-dark/30
        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2
        [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-white [&_h4]:mt-4 [&_h4]:mb-2
        [&_p]:my-3
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
        [&_li]:my-1
        [&_a]:text-gitbase-primary [&_a]:underline hover:[&_a]:no-underline
        [&_blockquote]:border-l-4 [&_blockquote]:border-gitbase-border-dark/50
        [&_blockquote]:pl-4 [&_blockquote]:text-gitbase-text-secondary [&_blockquote]:my-3
        [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-white/10
        [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
        [&_pre]:bg-[#282c34] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-3
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_table]:w-full [&_table]:my-3 [&_table]:text-left
        [&_th]:border [&_th]:border-gitbase-border-dark/30 [&_th]:px-3 [&_th]:py-1.5
        [&_th]:bg-white/5 [&_th]:font-semibold
        [&_td]:border [&_td]:border-gitbase-border-dark/30 [&_td]:px-3 [&_td]:py-1.5
        [&_hr]:border-gitbase-border-dark/30 [&_hr]:my-5
        [&_img]:max-w-full [&_img]:rounded
        [&_input[type=checkbox]]:mr-1.5
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
