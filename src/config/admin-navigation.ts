import type { LucideIcon } from 'lucide-react'
import {
  BadgeInfo,
  BarChart3,
  LayoutDashboard,
  Mail,
  MessageSquare,
  PackageSearch,
  Receipt,
  Settings,
  Shapes,
  ShieldAlert,
  ShoppingBag,
  Truck,
} from 'lucide-react'

export interface AdminNavItem {
  href: string
  labelAr: string
  labelEn: string
  descriptionAr: string
  descriptionEn: string
  icon: LucideIcon
}

export interface AdminNavSection {
  id: string
  labelAr: string
  labelEn: string
  items: AdminNavItem[]
}

export const adminNavigationSections: AdminNavSection[] = [
  {
    id: 'overview',
    labelAr: 'نظرة عامة',
    labelEn: 'Overview',
    items: [
      {
        href: '/admin',
        labelAr: 'لوحة التحكم',
        labelEn: 'Dashboard',
        descriptionAr: 'ملخص سريع للمبيعات والطلبات والتنبيهات المهمة.',
        descriptionEn: 'Quick sales, orders, and operational highlights.',
        icon: LayoutDashboard,
      },
      {
        href: '/admin/analytics',
        labelAr: 'التحليلات',
        labelEn: 'Analytics',
        descriptionAr: 'مؤشرات الأداء والاتجاهات العامة للمتجر.',
        descriptionEn: 'Performance trends and high-level store analytics.',
        icon: BarChart3,
      },
    ],
  },
  {
    id: 'catalog',
    labelAr: 'الكتالوج',
    labelEn: 'Catalog',
    items: [
      {
        href: '/admin/products',
        labelAr: 'المنتجات',
        labelEn: 'Products',
        descriptionAr: 'إدارة المنتجات والمخزون والنشر.',
        descriptionEn: 'Manage products, inventory, and publishing.',
        icon: ShoppingBag,
      },
      {
        href: '/admin/categories',
        labelAr: 'الفئات',
        labelEn: 'Categories',
        descriptionAr: 'تنظيم الفئات والصور المرتبطة بها.',
        descriptionEn: 'Organize categories and their related imagery.',
        icon: Shapes,
      },
      {
        href: '/admin/suppliers',
        labelAr: 'الموردون',
        labelEn: 'Suppliers',
        descriptionAr: 'بيانات الموردين وسجل التعاملات المرتبطة بهم.',
        descriptionEn: 'Supplier records and their related operations.',
        icon: Truck,
      },
    ],
  },
  {
    id: 'operations',
    labelAr: 'العمليات',
    labelEn: 'Operations',
    items: [
      {
        href: '/admin/orders',
        labelAr: 'الطلبات',
        labelEn: 'Orders',
        descriptionAr: 'مراجعة الطلبات وتتبع حالتها خطوة بخطوة.',
        descriptionEn: 'Review orders and track their lifecycle.',
        icon: Receipt,
      },
      {
        href: '/admin/payments',
        labelAr: 'المدفوعات',
        labelEn: 'Payments',
        descriptionAr: 'التحقق من المدفوعات ووصولات الدفع.',
        descriptionEn: 'Review payment proofs and payment statuses.',
        icon: ShieldAlert,
      },
      {
        href: '/admin/customers',
        labelAr: 'العملاء',
        labelEn: 'Customers',
        descriptionAr: 'إدارة العملاء وملفاتهم وامتيازات VIP.',
        descriptionEn: 'Manage customers, profiles, and VIP status.',
        icon: PackageSearch,
      },
    ],
  },
  {
    id: 'communication',
    labelAr: 'التواصل',
    labelEn: 'Communication',
    items: [
      {
        href: '/admin/comments',
        labelAr: 'التعليقات',
        labelEn: 'Comments',
        descriptionAr: 'مراجعة التعليقات المنشورة والمعلقة.',
        descriptionEn: 'Moderate published and pending comments.',
        icon: MessageSquare,
      },
      {
        href: '/admin/inbox',
        labelAr: 'الرسائل',
        labelEn: 'Inbox',
        descriptionAr: 'رسائل التواصل الواردة من الزوار والعملاء.',
        descriptionEn: 'Incoming contact messages from visitors and customers.',
        icon: Mail,
      },
    ],
  },
  {
    id: 'configuration',
    labelAr: 'إعدادات المتجر',
    labelEn: 'Store setup',
    items: [
      {
        href: '/admin/site-info',
        labelAr: 'معلومات المتجر',
        labelEn: 'Store Info',
        descriptionAr: 'الاسم والهوية وبيانات التواصل الأساسية.',
        descriptionEn: 'Store identity, branding, and contact details.',
        icon: BadgeInfo,
      },
      {
        href: '/admin/settings',
        labelAr: 'الإعدادات',
        labelEn: 'Settings',
        descriptionAr: 'الإعدادات العامة وسلوك المتجر.',
        descriptionEn: 'General store behavior and configuration.',
        icon: Settings,
      },
    ],
  },
]

export function flattenAdminNavigation() {
  return adminNavigationSections.flatMap((section) => section.items)
}

export function getAdminNavItem(pathname: string) {
  return flattenAdminNavigation().find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
