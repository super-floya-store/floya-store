import { expect, test } from '@playwright/test'

const adminUsername = 'ADMINFLOYA'
const adminPassword = 'Floya@Admin2026'

test('admin can create a product and customer can order it', async ({ page }) => {
  test.setTimeout(180000)

  const pageErrors: string[] = []
  const requestFailures: string[] = []

  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText?.includes('ERR_ABORTED')) return
    if (request.url().includes('/_next/') || request.url().includes('_rsc=')) return
    requestFailures.push(`${request.method()} ${request.url()} -> ${request.failure()?.errorText}`)
  })

  const uniqueId = Date.now()
  const categorySlug = `shop-cat-${uniqueId}`
  const productNameAr = `منتج اختبار ${uniqueId}`
  const productNameEn = `Storefront Product ${uniqueId}`

  await page.goto('/login')
  await page.getByLabel('اسم المستخدم').fill(adminUsername)
  await page.getByLabel('كلمة المرور').fill(adminPassword)
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click()
  await expect(page).toHaveURL(/\/admin$/, { timeout: 60000 })

  await page.goto('/admin/categories')
  await page.getByLabel('الاسم العربي').fill(`فئة متجر ${uniqueId}`)
  await page.getByLabel('الاسم الإنجليزي').fill(`Store Category ${uniqueId}`)
  await page.getByLabel('الرابط').fill(categorySlug)
  await page.getByRole('button', { name: 'إضافة فئة' }).click()
  await expect(page.getByText('تمت إضافة الفئة بنجاح')).toBeVisible()

  await page.goto('/admin/products/new')
  await page.getByLabel('الاسم (عربي) *').fill(productNameAr)
  await page.getByLabel('الاسم (إنجليزي) *').fill(productNameEn)
  await page.getByLabel('الفئة *').selectOption({ label: `فئة متجر ${uniqueId} (Store Category ${uniqueId})` })
  await page.getByLabel('السعر *').fill('2500')
  await page.getByLabel('المخزون *').fill('7')
  await page.getByRole('button', { name: 'حفظ المنتج' }).click()
  await expect(page).toHaveURL(/\/admin\/products$/, { timeout: 60000 })
  await expect(page.getByText(productNameAr)).toBeVisible()

  await page.getByRole('button', { name: 'تسجيل الخروج' }).click()
  await expect(page).toHaveURL(/\/login$/, { timeout: 60000 })

  await page.goto(`/categories/${categorySlug}`)
  await expect(page.getByText(productNameAr)).toBeVisible({ timeout: 60000 })
  await page.getByText(productNameAr).click()

  await expect(page.getByRole('heading', { name: productNameAr })).toBeVisible({ timeout: 60000 })
  await page.getByRole('button', { name: 'أضف للسلة' }).click()

  await page.goto('/cart')
  await expect(page.getByText(productNameAr)).toBeVisible()
  await page.getByRole('link', { name: 'إتمام الطلب' }).click()

  await expect(page).toHaveURL(/\/checkout$/, { timeout: 60000 })
  await page.getByLabel('الاسم الكامل *').fill('عميل اختبار')
  await page.getByLabel('رقم الهاتف *').fill('0555123456')
  await page.getByLabel('الولاية *').selectOption('تيزي وزو')
  await page.getByLabel('البلدية *').fill('تيزي وزو')
  await page.getByLabel('عنوان التوصيل *').fill('حي الاختبار، شارع 123، الجزائر')
  await page.getByRole('button', { name: 'تأكيد الطلب' }).click()

  await expect(page.getByText('تم تأكيد طلبك!')).toBeVisible({ timeout: 60000 })
  await expect(page.getByText(/رقم الطلب:/)).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(requestFailures).toEqual([])
})
