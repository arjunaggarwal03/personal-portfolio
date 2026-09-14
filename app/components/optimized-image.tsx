import 'server-only'

import { getImageProps, type ImageProps } from 'next/image'
import { preload as preloadResource } from 'react-dom'

type OptimizedImageProps = Omit<ImageProps, 'preload' | 'priority'> & {
  preload?: boolean
}

/**
 * Keep Next's image optimization and responsive `srcset` without hydrating the
 * client Image component on otherwise static routes.
 */
export function OptimizedImage({
  preload = false,
  fetchPriority,
  ...input
}: OptimizedImageProps) {
  const resolvedFetchPriority = fetchPriority ?? (preload ? 'high' : undefined)
  const { props } = getImageProps({
    ...input,
    fetchPriority: resolvedFetchPriority,
    preload,
  })

  if (preload) {
    preloadResource(props.src, {
      as: 'image',
      fetchPriority: resolvedFetchPriority,
      imageSizes: props.sizes,
      imageSrcSet: props.srcSet,
    })
  }

  const { alt, ...optimizedProps } = props

  // getImageProps produces the same optimized attributes as next/image; the
  // native element is intentional here because these images need no client JS.
  // oxlint-disable-next-line nextjs/no-img-element
  return <img alt={alt} {...optimizedProps} />
}
