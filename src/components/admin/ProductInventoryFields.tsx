'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminProductType, AdminProductVariant, getDerivedStockQuantity } from './product-ui-config'

interface ProductInventoryFieldsProps {
  locale?: 'ar' | 'en'
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
  locale = 'ar',
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
  const copy = locale === 'ar'
    ? {
        type: 'نوع المنتج',
        simple: 'منتج عادي',
        variant: 'ملابس مع متغيرات مقاس/لون',
        digitalAccount: 'حساب رقمي',
        digitalText: 'نصوص / أكواد متعددة الأسطر',
        stock: 'المخزون *',
        variantsTitle: 'المقاسات والألوان',
        variantsSubtitle: 'كل سطر يمكنه حفظ مقاس ولون ومخزون وسعر إضافي اختياري.',
        addVariant: 'إضافة متغير',
        emptyVariants: 'أضف متغيراً واحداً على الأقل إذا كان المنتج يعتمد على المقاسات أو الألوان.',
        sizePlaceholder: 'المقاس: S / 38 / XL',
        colorPlaceholder: 'اللون: أسود / أبيض',
        stockPlaceholder: 'المخزون',
        variantPricePlaceholder: 'سعر المتغير',
        remove: 'حذف',
        variantNumber: 'المتغير',
        derivedStock: 'المخزون المحسوب',
        currentThreshold: 'حد التنبيه الحالي',
        digitalTitle: 'المخزون الرقمي',
        digitalTextHelp: 'ألصق كل نص أو كود أو بيانات تسليم ككتلة كاملة. افصل بين كل عملية تسليم وأخرى بسطر فارغ أو بسطر يحتوي على --- فقط.',
        digitalAccountHelp: 'ألصق كل حساب أو كود أو بيانات تسليم في سطر منفصل. سيتم حساب المخزون تلقائياً.',
      }
    : {
        type: 'Product type',
        simple: 'Standard product',
        variant: 'Clothing with size/color variants',
        digitalAccount: 'Digital account',
        digitalText: 'Multiline text / codes',
        stock: 'Stock *',
        variantsTitle: 'Sizes and colors',
        variantsSubtitle: 'Each row can store a size, color, stock quantity, and optional price override.',
        addVariant: 'Add variant',
        emptyVariants: 'Add at least one variant if the product depends on size or color.',
        sizePlaceholder: 'Size: S / 38 / XL',
        colorPlaceholder: 'Color: Black / White',
        stockPlaceholder: 'Stock',
        variantPricePlaceholder: 'Variant price',
        remove: 'Remove',
        variantNumber: 'Variant',
        derivedStock: 'Derived stock',
        currentThreshold: 'Current threshold',
        digitalTitle: 'Digital inventory',
        digitalTextHelp: 'Paste each text block, code, or delivery payload as a full block. Separate each delivery with a blank line or a line containing only --- .',
        digitalAccountHelp: 'Paste each account, code, or delivery payload on a separate line. Stock will be counted automatically.',
      }
  const derivedStockQuantity = getDerivedStockQuantity(productType, manualStockQuantity, {
    productType,
    variants,
    digitalInventoryText,
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product-type">{copy.type}</Label>
        <select
          id="product-type"
          value={productType}
          onChange={(e) => onProductTypeChange(e.target.value as AdminProductType)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="physical_simple">{copy.simple}</option>
          <option value="physical_variant">{copy.variant}</option>
          <option value="digital_account">{copy.digitalAccount}</option>
          <option value="digital_text">{copy.digitalText}</option>
        </select>
      </div>

      {productType === 'physical_simple' && (
        <div className="space-y-2">
          <Label htmlFor="product-stock">{copy.stock}</Label>
          <Input id="product-stock" type="number" value={manualStockQuantity} onChange={(e) => onManualStockQuantityChange(e.target.value)} required />
        </div>
      )}

      {productType === 'physical_variant' && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{copy.variantsTitle}</p>
              <p className="text-xs text-muted-foreground">{copy.variantsSubtitle}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => onVariantsChange([...variants, createVariantRow()])}>
              {copy.addVariant}
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="rounded-md bg-muted/40 px-3 py-4 text-sm text-muted-foreground">{copy.emptyVariants}</div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={`${variant.id || 'new'}-${index}`} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_120px_120px_auto]">
                  <Input
                    value={variant.size}
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, size: e.target.value } : item))}
                    placeholder={copy.sizePlaceholder}
                  />
                  <Input
                    value={variant.color}
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, color: e.target.value } : item))}
                    placeholder={copy.colorPlaceholder}
                  />
                  <Input
                    value={variant.stock_quantity}
                    type="number"
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, stock_quantity: Math.max(0, parseInt(e.target.value || '0', 10) || 0) } : item))}
                    placeholder={copy.stockPlaceholder}
                  />
                  <Input
                    value={variant.price_override ?? ''}
                    type="number"
                    step="0.01"
                    onChange={(e) => onVariantsChange(variants.map((item, itemIndex) => itemIndex === index ? { ...item, price_override: e.target.value ? parseFloat(e.target.value) : null } : item))}
                    placeholder={copy.variantPricePlaceholder}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-center"
                    onClick={() => onVariantsChange(variants.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    {copy.remove}
                  </Button>
                  <p className="text-xs text-muted-foreground md:col-span-5">{copy.variantNumber} #{index + 1}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-stock-derived-clothes">{copy.derivedStock}</Label>
              <Input id="product-stock-derived-clothes" value={derivedStockQuantity} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-low-stock-summary-clothes">{copy.currentThreshold}</Label>
              <Input id="product-low-stock-summary-clothes" value={lowStockThreshold} disabled />
            </div>
          </div>
        </div>
      )}

      {(productType === 'digital_account' || productType === 'digital_text') && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div>
            <p className="text-sm font-medium">{copy.digitalTitle}</p>
            <p className="text-xs text-muted-foreground">
              {productType === 'digital_text'
                ? copy.digitalTextHelp
                : copy.digitalAccountHelp}
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
              <Label htmlFor="product-stock-derived-digital">{copy.derivedStock}</Label>
              <Input id="product-stock-derived-digital" value={derivedStockQuantity} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-low-stock-summary-digital">{copy.currentThreshold}</Label>
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
