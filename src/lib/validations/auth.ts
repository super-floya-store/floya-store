import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم يجب أن لا يتجاوز 50 حرف')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم يجب أن لا يتجاوز 50 حرف')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
    .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
      .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
      .regex(/[!@#$%^&*]/, 'يجب أن تحتوي على رمز خاص'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
