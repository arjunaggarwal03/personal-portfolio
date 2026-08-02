type CloudinaryError = Error & {
  http_code?: number
  error?: { http_code?: number }
}

export async function uploadCloudinaryWithLookup<T>(options: {
  upload: () => Promise<T>
  lookup: () => Promise<T>
}): Promise<T> {
  try {
    return await options.upload()
  } catch (caught) {
    const error = caught as CloudinaryError
    const status = error.http_code ?? error.error?.http_code
    if (status !== 409) throw caught
    return options.lookup()
  }
}
