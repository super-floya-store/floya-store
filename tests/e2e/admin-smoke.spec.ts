import { expect, test } from '@playwright/test'

const adminUsername = 'ADMINFLOYA'
const adminPassword = 'Floya@Admin2026'

test('admin can log in and create a category', async ({ page }) => {
  test.setTimeout(120000)

  const pageErrors: string[] = []
  const requestFailures: string[] = []

  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText?.includes('ERR_ABORTED')) {
      return
    }
    if (request.url().includes('/_next/') || request.url().includes('_rsc=')) {
      return
    }
    requestFailures.push(`${request.method()} ${request.url()} -> ${request.failure()?.errorText}`)
  })

  await page.goto('/login')
  await page.getByLabel('اسم المستخدم').fill(adminUsername)
  await page.getByLabel('كلمة المرور').fill(adminPassword)
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click()

  await expect(page).toHaveURL(/\/admin$/, { timeout: 60000 })
  await expect(page.getByRole('heading', { name: 'لوحة التحكم' })).toBeVisible()

  await page.goto('/admin/products')
  await expect(page.getByRole('heading', { name: 'المنتجات' })).toBeVisible()

  await page.goto('/admin/categories')
  await expect(page.getByRole('heading', { name: 'الفئات' })).toBeVisible()

  const uniqueSlug = `playwright-cat-${Date.now()}`

  await page.getByLabel('الاسم العربي').fill('فئة اختبار')
  await page.getByLabel('الاسم الإنجليزي').fill('Playwright Category')
  await page.getByLabel('الرابط').fill(uniqueSlug)
  await page.getByRole('button', { name: 'إضافة فئة' }).click()

  await expect(page.getByText('تمت إضافة الفئة بنجاح')).toBeVisible()
  await expect(page.getByText(uniqueSlug)).toBeVisible()

  await page.goto('/admin/orders')
  await expect(page.getByRole('heading', { name: 'الطلبات' })).toBeVisible()

  await page.goto('/admin/settings')
  await expect(page.getByRole('heading', { name: 'إعدادات المتجر' })).toBeVisible()
  await page.getByLabel('هاتف التواصل').fill('0555000000')
  await page.getByRole('button', { name: 'حفظ الإعدادات' }).click()
  await expect(page.getByText('تم حفظ الإعدادات بنجاح')).toBeVisible()

  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)

  expect(pageErrors).toEqual([])
  expect(requestFailures).toEqual([])
})
