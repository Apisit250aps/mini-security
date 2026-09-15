import { ConfirmModal } from './render-alert';
import { InfoModal } from './info/render-info-alert';

/** Add alert implementations here, then expose their controls in the provider. */
export const alertVariants = {
  confirm: ConfirmModal,
  info: InfoModal,
} as const;

export type AlertVariant = keyof typeof alertVariants;
