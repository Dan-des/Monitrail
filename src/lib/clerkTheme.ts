import { dark } from '@clerk/themes';

/**
 * Returns a cohesive Clerk appearance configuration that adheres to
 * Monitrail's zinc palette, typography standards, and contrast guidelines.
 *
 * Sizing & Accessibility:
 * - Card max-width 440px, padding ~2rem.
 * - Title 1.75rem bold, subtitle 1rem.
 * - Labels 1rem semibold.
 * - Inputs 3.25rem height, 1.0625rem (17px) font, medium weight.
 * - Primary button 3.25rem height, 1.0625rem bold.
 * - Social button 3.25rem height, 1rem font.
 * - Footer links 1rem semibold.
 * - Error / helper text 0.9375rem.
 * - Field spacing ~1.25rem.
 * - Input font >= 16px to prevent iOS Safari auto-zoom on focus.
 */
export function getClerkAppearance(isDark: boolean) {
  return {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: isDark ? '#f4f4f5' : '#18181b',     // zinc-100 / zinc-900
      colorBackground: isDark ? '#18181b' : '#ffffff',   // zinc-900 / white
      colorText: isDark ? '#f4f4f5' : '#09090b',         // zinc-100 / zinc-950
      colorTextSecondary: isDark ? '#a1a1aa' : '#71717a', // zinc-400 / zinc-500
      colorInputBackground: isDark ? '#27272a' : '#fafafa', // zinc-800 / zinc-50
      colorInputText: isDark ? '#fafafa' : '#09090b',    // zinc-50 / zinc-950
      borderRadius: '0.875rem',                          // 14px
      fontSize: '1.0625rem',                             // 17px base
      fontWeight: {
        normal: 500,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      spaceBetweenFields: '1.25rem',
    },
    elements: {
      rootBox: 'w-full',
      card: isDark
        ? '!w-full !max-w-[440px] !rounded-2xl !border !border-zinc-800 !bg-zinc-900 !p-8 !shadow-xl'
        : '!w-full !max-w-[440px] !rounded-2xl !border !border-zinc-200/80 !bg-white !p-8 !shadow-sm',
      headerTitle: isDark
        ? '!text-[1.75rem] !leading-tight !font-bold !tracking-tight !text-zinc-100'
        : '!text-[1.75rem] !leading-tight !font-bold !tracking-tight !text-zinc-900',
      headerSubtitle: isDark
        ? '!text-[1rem] !font-medium !text-zinc-400 !mt-1.5'
        : '!text-[1rem] !font-medium !text-zinc-500 !mt-1.5',
      formFieldLabel: isDark
        ? '!text-[1rem] !font-semibold !text-zinc-200 !mb-1.5'
        : '!text-[1rem] !font-semibold !text-zinc-800 !mb-1.5',
      formFieldInput: isDark
        ? '!h-[3.25rem] !min-h-[3.25rem] !px-4 !py-3 !text-[1.0625rem] !font-medium !rounded-xl !bg-zinc-800 !border !border-zinc-700 !text-zinc-100 focus:!border-zinc-500 focus:!ring-2 focus:!ring-zinc-100/10 transition-all'
        : '!h-[3.25rem] !min-h-[3.25rem] !px-4 !py-3 !text-[1.0625rem] !font-medium !rounded-xl !bg-zinc-50 !border !border-zinc-200 !text-zinc-900 focus:!border-zinc-400 focus:!ring-2 focus:!ring-zinc-900/10 transition-all',
      formButtonPrimary: isDark
        ? '!h-[3.25rem] !min-h-[3.25rem] !px-4 !py-3 !text-[1.0625rem] !font-bold !rounded-xl !bg-zinc-100 !text-zinc-900 hover:!bg-zinc-200 active:!bg-zinc-300 !shadow-sm transition-all cursor-pointer'
        : '!h-[3.25rem] !min-h-[3.25rem] !px-4 !py-3 !text-[1.0625rem] !font-bold !rounded-xl !bg-zinc-900 !text-white hover:!bg-zinc-800 active:!bg-zinc-700 !shadow-sm transition-all cursor-pointer',
      socialButtonsBlockButton: isDark
        ? '!h-[3.25rem] !min-h-[3.25rem] !px-4 !py-3 !text-[1rem] !font-semibold !rounded-xl !border !border-zinc-700 !bg-zinc-800/80 hover:!bg-zinc-800 !text-zinc-100 transition-all cursor-pointer'
        : '!h-[3.25rem] !min-h-[3.25rem] !px-4 !py-3 !text-[1rem] !font-semibold !rounded-xl !border !border-zinc-200 !bg-white hover:!bg-zinc-50 !text-zinc-800 transition-all cursor-pointer',
      socialButtonsBlockButtonText: isDark
        ? '!text-[1rem] !font-semibold !text-zinc-100'
        : '!text-[1rem] !font-semibold !text-zinc-800',
      footerActionLink: isDark
        ? '!text-[1rem] !font-semibold !text-zinc-100 hover:!text-white hover:!underline transition-colors'
        : '!text-[1rem] !font-semibold !text-zinc-900 hover:!text-zinc-700 hover:!underline transition-colors',
      footerActionText: isDark
        ? '!text-[1rem] !font-medium !text-zinc-400'
        : '!text-[1rem] !font-medium !text-zinc-500',
      formFieldErrorText: isDark
        ? '!text-[0.9375rem] !font-semibold !text-rose-400 !mt-1.5'
        : '!text-[0.9375rem] !font-semibold !text-rose-600 !mt-1.5',
      formFieldSuccessText: isDark
        ? '!text-[0.9375rem] !font-medium !text-emerald-400 !mt-1'
        : '!text-[0.9375rem] !font-medium !text-emerald-600 !mt-1',
      formFieldWarningText: isDark
        ? '!text-[0.9375rem] !font-medium !text-amber-400 !mt-1'
        : '!text-[0.9375rem] !font-medium !text-amber-600 !mt-1',
      formFieldHintText: isDark
        ? '!text-[0.9375rem] !font-normal !text-zinc-400'
        : '!text-[0.9375rem] !font-normal !text-zinc-500',
      alert: isDark
        ? '!rounded-xl !border !border-rose-800/80 !bg-rose-950/40 !p-3.5 !text-rose-300'
        : '!rounded-xl !border !border-rose-200 !bg-rose-50 !p-3.5 !text-rose-700',
      alertText: isDark
        ? '!text-[0.9375rem] !font-medium !text-rose-300'
        : '!text-[0.9375rem] !font-medium !text-rose-700',
      dividerLine: isDark ? '!bg-zinc-800' : '!bg-zinc-200',
      dividerText: isDark
        ? '!text-xs !font-semibold !uppercase !tracking-wider !text-zinc-500'
        : '!text-xs !font-semibold !uppercase !tracking-wider !text-zinc-400',
      identityPreviewText: isDark
        ? '!text-[1rem] !font-medium !text-zinc-200'
        : '!text-[1rem] !font-medium !text-zinc-800',
      identityPreviewEditButtonIcon: isDark
        ? '!text-zinc-400 hover:!text-zinc-200'
        : '!text-zinc-500 hover:!text-zinc-800',
      formResendCodeLink: isDark
        ? '!text-[1rem] !font-semibold !text-zinc-200 hover:!text-white'
        : '!text-[1rem] !font-semibold !text-zinc-800 hover:!text-zinc-950',
    },
  };
}
