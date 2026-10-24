import { dark } from '@clerk/themes';

/**
 * Returns a cohesive Clerk appearance configuration that adheres to
 * Monitrail's zinc palette, typography standards, and contrast guidelines.
 *
 * Sizing & Accessibility:
 * - Base font size is raised to 1.0625rem (17px) with bold weights for titles and semibold labels.
 * - Input font size is strictly >= 16px to prevent iOS Safari auto-zoom on focus.
 * - Minimum touch target heights (48px) for buttons and inputs.
 * - WCAG-compliant contrast in both light and dark modes.
 */
export function getClerkAppearance(isDark: boolean) {
  return {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: isDark ? '#f4f4f5' : '#18181b', // zinc-100 (dark) / zinc-900 (light)
      colorBackground: isDark ? '#18181b' : '#ffffff', // zinc-900 (dark) / white (light)
      colorText: isDark ? '#f4f4f5' : '#09090b', // zinc-100 (dark) / zinc-950 (light)
      colorTextSecondary: isDark ? '#a1a1aa' : '#71717a', // zinc-400 (dark) / zinc-500 (light)
      colorInputBackground: isDark ? '#27272a' : '#fafafa', // zinc-800 (dark) / zinc-50 (light)
      colorInputText: isDark ? '#fafafa' : '#09090b', // zinc-50 (dark) / zinc-950 (light)
      borderRadius: '0.875rem', // 14px base border radius
      fontSize: '1.0625rem', // 17px base typography
      fontWeight: {
        normal: 500,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    elements: {
      rootBox: 'w-full max-w-md',
      card: isDark
        ? '!w-full !rounded-2xl !border !border-zinc-800 !bg-zinc-900 !p-6 sm:!p-8 !shadow-xl'
        : '!w-full !rounded-2xl !border !border-zinc-200/80 !bg-white !p-6 sm:!p-8 !shadow-sm',
      headerTitle: isDark
        ? '!text-2xl sm:!text-3xl !font-bold !tracking-tight !text-zinc-100'
        : '!text-2xl sm:!text-3xl !font-bold !tracking-tight !text-zinc-900',
      headerSubtitle: isDark
        ? '!text-base !font-medium !text-zinc-400 !mt-1.5'
        : '!text-base !font-medium !text-zinc-500 !mt-1.5',
      formFieldLabel: isDark
        ? '!text-base !font-semibold !text-zinc-200 !mb-1.5'
        : '!text-base !font-semibold !text-zinc-800 !mb-1.5',
      formFieldInput: isDark
        ? '!h-12 !min-h-[48px] !px-4 !py-3 !text-base !font-medium !rounded-xl !bg-zinc-800 !border !border-zinc-700 !text-zinc-100 placeholder:!text-base placeholder:!font-normal placeholder:!text-zinc-400 focus:!border-zinc-500 focus:!ring-2 focus:!ring-zinc-100/10 transition-all'
        : '!h-12 !min-h-[48px] !px-4 !py-3 !text-base !font-medium !rounded-xl !bg-zinc-50 !border !border-zinc-200 !text-zinc-900 placeholder:!text-base placeholder:!font-normal placeholder:!text-zinc-500 focus:!border-zinc-400 focus:!ring-2 focus:!ring-zinc-900/10 transition-all',
      formButtonPrimary: isDark
        ? '!h-12 !min-h-[48px] !px-4 !py-3 !text-base !font-bold !rounded-xl !bg-zinc-100 !text-zinc-900 hover:!bg-zinc-200 active:!bg-zinc-300 !shadow-sm transition-all cursor-pointer'
        : '!h-12 !min-h-[48px] !px-4 !py-3 !text-base !font-bold !rounded-xl !bg-zinc-900 !text-white hover:!bg-zinc-800 active:!bg-zinc-700 !shadow-sm transition-all cursor-pointer',
      socialButtonsBlockButton: isDark
        ? '!h-12 !min-h-[48px] !px-4 !py-3 !text-base !font-semibold !rounded-xl !border !border-zinc-700 !bg-zinc-800/80 hover:!bg-zinc-800 !text-zinc-100 transition-all cursor-pointer'
        : '!h-12 !min-h-[48px] !px-4 !py-3 !text-base !font-semibold !rounded-xl !border !border-zinc-200 !bg-white hover:!bg-zinc-50 !text-zinc-800 transition-all cursor-pointer',
      socialButtonsBlockButtonText: isDark
        ? '!text-base !font-semibold !text-zinc-100'
        : '!text-base !font-semibold !text-zinc-800',
      footerActionLink: isDark
        ? '!text-base !font-semibold !text-zinc-100 hover:!text-white hover:!underline transition-colors'
        : '!text-base !font-semibold !text-zinc-900 hover:!text-zinc-700 hover:!underline transition-colors',
      footerActionText: isDark
        ? '!text-base !font-medium !text-zinc-400'
        : '!text-base !font-medium !text-zinc-500',
      formFieldErrorText: isDark
        ? '!text-sm !font-semibold !text-rose-400 !mt-1.5'
        : '!text-sm !font-semibold !text-rose-600 !mt-1.5',
      alert: isDark
        ? '!rounded-xl !border !border-rose-800/80 !bg-rose-950/40 !p-3.5 !text-rose-300'
        : '!rounded-xl !border !border-rose-200 !bg-rose-50 !p-3.5 !text-rose-700',
      alertText: isDark
        ? '!text-sm !font-medium !text-rose-300'
        : '!text-sm !font-medium !text-rose-700',
      dividerLine: isDark ? '!bg-zinc-800' : '!bg-zinc-200',
      dividerText: isDark
        ? '!text-xs !font-semibold !uppercase !tracking-wider !text-zinc-500'
        : '!text-xs !font-semibold !uppercase !tracking-wider !text-zinc-400',
      identityPreviewText: isDark
        ? '!text-base !font-medium !text-zinc-200'
        : '!text-base !font-medium !text-zinc-800',
      identityPreviewEditButtonIcon: isDark
        ? '!text-zinc-400 hover:!text-zinc-200'
        : '!text-zinc-500 hover:!text-zinc-800',
      formResendCodeLink: isDark
        ? '!text-base !font-semibold !text-zinc-200 hover:!text-white'
        : '!text-base !font-semibold !text-zinc-800 hover:!text-zinc-950',
    },
  };
}
