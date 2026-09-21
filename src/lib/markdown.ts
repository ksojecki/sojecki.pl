import { marked, Renderer } from 'marked';

const safeHref = (href: string) => /^(https?:|mailto:|\/|#)/i.test(href) ? href : '#';

export function renderMarkdown(source: string) {
  const renderer = new Renderer();
  renderer.html = () => '';
  renderer.link = ({ href, title, tokens }) => {
    const label = renderer.parser.parseInline(tokens);
    const target = safeHref(href);
    const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : '';
    return `<a href="${escapeAttribute(target)}"${titleAttribute}>${label}</a>`;
  };
  return marked.parse(source, { renderer });
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
