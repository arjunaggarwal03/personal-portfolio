import { expect, test } from '@playwright/test'

test('removed now-playing polling endpoint stays absent', async ({
  request,
}) => {
  const response = await request.get('/api/now-playing')
  expect(response.status()).toBe(404)
})
