'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminProductType, AdminProductVariant, getDerivedStockQuantity } from './product-ui-config'

interface ProductInventoryFieldsProps {
  productType: AdminProductType
  onProductTypeChange: (value: AdminProductType) => void
  manualStockQuantity: string
  onManualStockQuantityChange: (value: string) => void
  variants: AdminProductVariant[]
  onVariantsChange: (value: AdminProductVariant[]) => void
  digitalInventoryText: string
  onDigitalInventoryTextChange: (value: string) => void
  lowStockThreshold: string
  storageWarning?: string | null
}

function createVariantRow(): AdminProductVariant {
  return {
    size: '',
    color: '',
    stock_quantity: 0,
    price_override: null,
  }
}

export function ProductInventoryFields({
  productType,
  onProductTypeChange,
  manualStockQuantity,
  onManualStockQuantityChange,
  variants,
  onVariantsChange,
  digitalInventoryText,
  onDigitalInventoryTextChange,
  lowStockThreshold,
  storageWarning,
}: ProductInventoryFieldsProps) {
  const derivedStockQuantity = getDerivedStockQuantity(productType, manualStockQuantity, {
    productType,
    variants,
    digitalInventoryText,
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product-type">نوع المنتج</Label>
        <select
          id="product-type"
          value={productType}
          onChange={(e) => onProductTypeChange(e.target.value as AdminProductType)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="physical_simple">منتج عادي</option>
          <option value="physical_variant">ملابس مع متغيرات مقاس/لون</option>
          <option value="digital_account">حساب رقمي</option>
          <option value="digital_text">نصوص / أكواد متعددة الأسطر</option>
        </select>
      </div>

      {productType === 'physical_simple' && (
        <div className="space-y-2">
          <Label htmlFor="product-stock">المخزون *</Label>
          <Input id="product-stock" type="number" value={manualStockQuantity} onChange={(e) => onManualStockQuantityChange(e.target.value)} required />
        </div>
      )}

      {productType === 'physical_variant' && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">المقاسات والألوان</p>
              <p className="text-xs text-muted-foreground">كل سطر يمكنه حفظ مقاس ولون ومخزون وسعر إضافي اختياري.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => onVariantsChange([...variants, createVariantRow()])}>
              إضافة متغير
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="rounded-md bg-muted/40 px-3 py-4 text-sm text-muted-foreground">أضف متغيراً واحداً على الأقل إذا كان المنتج يعتمد على المقاسات أو الألوان.</div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={`${variant.id || 'new'}-${index}`} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_120px_120px_auto]">
                  <Input
                    value={variant.size}
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, size: e.target.value } : item))}
                    placeholder="المقاس: S / 38 / XL"
                  />
                  <Input
                    value={variant.color}
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, color: e.target.value } : item))}
                    placeholder="اللون: أسود / أبيض"
                  />
                  <Input
                    value={variant.stock_quantity}
                    type="number"
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, stock_quantity: Math.max(0, parseInt(e.target.value || '0', 10) || 0) } : item))}
                    placeholder="المخزون"
                  />
                  <Input
                    value={variant.price_override ?? ''}
                    type="number"
                    step="0.01"
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, price_override: e.target.value ? parseFloat(e.target.value) : null } : item))}
                    placeholder="سعر المتغير"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-center"
                    onClick={() => onVariantsChange(variants.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    حذف
                  </Button>
                  <p className="text-xs text-muted-foreground md:col-span-5">المتغير #{index + 1}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-stock-derived-clothes">المخزون المحسوب</Label>
              <Input id="product-stock-derived-clothes" value={derivedStockQuantity} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-low-stock-summary-clothes">حد التنبيه الحالي</Label>
              <Input id="product-low-stock-summary-clothes" value={lowStockThreshold} disabled />
            </div>
          </div>
        </div>
      )}

      {(productType === 'digital_account' || productType === 'digital_text') && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div>
            <p className="text-sm font-medium">المخزون الرقمي</p>
            <p className="text-xs text-muted-foreground">
              {productType === 'digital_text'
                ? 'ألصق كل نص أو كود أو بيانات تسليم ككتلة كاملة. افصل بين كل عملية تسليم وأخرى بسطر فارغ أو بسطر يحتوي على --- فقط.'
                : 'ألصق كل حساب أو كود أو بيانات تسليم في سطر منفصل. سيتم حساب المخزون تلقائياً.'}
            </p>
          </div>
          <textarea
            value={digitalInventoryText}
            onChange={(e) => onDigitalInventoryTextChange(e.target.value)}
            className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={productType === 'digital_text'
              ? 'Netflix account 1\nEmail: demo@example.com\nPassword: pass123\nProfile PIN: 4455\n\n---\n\nCanva invite\nOpen this link:\nhttps://example.com/invite/123'
              : 'email:pass\nlogin|password|note\nhttps://delivery-link.example/item/123'}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-stock-derived-digital">المخزون المحسوب</Label>
              <Input id="product-stock-derived-digital" value={derivedStockQuantity} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-low-stock-summary-digital">حد التنبيه الحالي</Label>
              <Input id="product-low-stock-summary-digital" value={lowStockThreshold} disabled />
            </div>
          </div>
          {storageWarning && <p className="text-xs text-amber-700">{storageWarning}</p>}
        </div>
      )}

      {productType !== 'digital_account' && productType !== 'digital_text' && storageWarning && <p className="text-xs text-amber-700">{storageWarning}</p>}
    </div>
  )
}
