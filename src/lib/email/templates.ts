import type { OrderWithItems } from '@/types/order'
import type { StoreSettingsMap } from '@/lib/settings/store-settings'
import type { Comment } from '@/types/comment'

function replaceTemplateVariables(template: string, variables: Record<string, string>) {
  return Object.entries(variables).reduce((current, [key, value]) => {
    return current.replaceAll(`{{${key}}}`, value)
  }, template)
}

export function buildOrderConfirmationEmail(order: OrderWithItems, settings: StoreSettingsMap) {
  const subjectTemplate =
    settings.email_templates?.order_confirmation?.subject || 'تأكيد طلبك {{order_number}}'
  const htmlTemplate =
    settings.email_templates?.order_confirmation?.html ||
    '<div dir="rtl"><h2>شكراً لك {{customer_name}}</h2><p>تم استلام طلبك {{order_number}}</p></div>'

  const variables = {
    customer_name: order.customer_name,
    order_number: order.order_number,
    order_total: `${order.total.toLocaleString()} د.ج`,
    store_name: settings.store_name?.ar || 'فلويا ستور',
  }

  return {
    subject: replaceTemplateVariables(subjectTemplate, variables),
    html: replaceTemplateVariables(htmlTemplate, variables),
  }
}

export function buildOrderStatusEmail(order: OrderWithItems, settings: StoreSettingsMap) {
  const subjectTemplate =
    settings.email_templates?.order_status_update?.subject || 'تحديث حالة الطلب {{order_number}}'
  const htmlTemplate =
    settings.email_templates?.order_status_update?.html ||
    '<div dir="rtl"><p>تم تحديث حالة طلبك {{order_number}} إلى {{order_status}}</p><p>{{tracking_block}}</p></div>'

  const variables = {
    customer_name: order.customer_name,
    order_number: order.order_number,
    order_status: order.status,
    tracking_block: order.tracking_number ? `رقم التتبع: ${order.tracking_number}` : '',
    store_name: settings.store_name?.ar || 'فلويا ستور',
  }

  return {
    subject: replaceTemplateVariables(subjectTemplate, variables),
    html: replaceTemplateVariables(htmlTemplate, variables),
  }
}

export function buildNewCommentEmail(comment: Comment, settings: StoreSettingsMap) {
  const subjectTemplate =
    settings.email_templates?.new_comment?.subject || 'تعليق جديد بانتظار المراجعة'
  const htmlTemplate =
    settings.email_templates?.new_comment?.html ||
    '<div dir="rtl"><p>تم إرسال تعليق جديد من {{customer_name}}</p><p>{{comment}}</p></div>'

  const variables = {
    entity_type: comment.entity_type === 'product' ? 'منتج' : 'فئة',
    customer_name: comment.customer_name,
    rating: String(comment.rating),
    comment: comment.comment,
  }

  return {
    subject: replaceTemplateVariables(subjectTemplate, variables),
    html: replaceTemplateVariables(htmlTemplate, variables),
  }
}
