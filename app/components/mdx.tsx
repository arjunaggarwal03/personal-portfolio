import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { PluggableList } from 'unified'
import { Callout, Aside, Quote, ImageWithCaption } from './prose'
import { SystemDiagram } from './system-diagram'

const remarkPlugins: PluggableList = [remarkGfm]
const rehypePlugins: PluggableList = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
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
    return <a {...props} />
  }
  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function Code({ children, ...props }: { children?: string }) {
  const codeHTML = highlight(typeof children === 'string' ? children : '')
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
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
  code: Code,
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
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
