import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'
import rehypeShiki from '@shikijs/rehype'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { PluggableList } from 'unified'
import { Callout, Aside, Quote, ImageWithCaption } from './prose'
import { SystemDiagram } from './system-diagram'
import { NewTabIndicator } from './external-link'
import { codeTheme } from './code-theme'

const remarkPlugins: PluggableList = [remarkGfm]
const rehypePlugins: PluggableList = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
  // Shiki highlights fenced code blocks at build time (VS Code-grade grammars)
  // using our warm, WCAG-tuned theme. Replaces the runtime sugar-high call.
  [rehypeShiki, { theme: codeTheme }],
]

const mdxOptions = {
  mdxOptions: { remarkPlugins, rehypePlugins },
}

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href ?? ''
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }
  if (href.startsWith('#')) {
    return <a {...props}>{props.children}</a>
  }
  const { children, ...rest } = props
  return (
    <a target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <NewTabIndicator />
    </a>
  )
}

function MdxImage({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== 'string') return null
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={0}
      height={0}
      sizes="(max-width: 760px) 100vw, 760px"
      className="h-auto w-full rounded-lg border border-border-soft"
    />
  )
}

const components = {
  a: CustomLink,
  img: MdxImage,
  Callout,
  Aside,
  Quote,
  SystemDiagram,
  ImageWithCaption,
}

export function CustomMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      options={mdxOptions}
      components={{ ...components, ...props.components }}
    />
  )
}
