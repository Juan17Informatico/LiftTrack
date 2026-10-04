import { useTranslation } from '@/i18n';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AlertCircle, Check, Info, Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useDialogStore, type DialogRequest } from '@/store/dialogStore';
import { getErrorMessage } from '@/utils/errors';

export function AppDialog() {
  const dialog = useDialogStore((state) => state.queue[0]);
  return dialog ? <DialogContent key={dialog.id} dialog={dialog} /> : null;
}

function DialogContent({ dialog }: { dialog: DialogRequest }) {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  const dismiss = useDialogStore((state) => state.dismiss);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const working = useRef(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const destructive = dialog.tone === 'danger';
  const accent = destructive || dialog.tone === 'error' ? colors.danger : colors.success;
  const Icon = destructive
    ? Trash2
    : dialog.tone === 'success'
      ? Check
      : dialog.tone === 'error'
        ? AlertCircle
        : Info;

  function close() {
    if (!working.current) dismiss(dialog.id);
  }

  async function confirm() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError(null);
    try {
      await dialog.onConfirm?.();
      dismiss(dialog.id);
    } catch (caught) {
      setError(getErrorMessage(caught));
      working.current = false;
      setBusy(false);
    }
  }

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={close}>
      <View
        style={[
          styles.overlay,
          {
            justifyContent: width >= 600 ? 'center' : 'flex-end',
            paddingTop: insets.top + 20,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessible={false}
          disabled={busy}
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={[styles.accentLine, { backgroundColor: accent }]} />
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <View style={styles.topRow}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: `${accent}18`, borderColor: `${accent}33` },
                ]}
              >
                <Icon size={28} color={accent} strokeWidth={1.8} />
              </View>
              <Pressable
                accessibilityLabel={t('Cerrar diálogo')}
                accessibilityRole="button"
                disabled={busy}
                onPress={close}
                style={styles.close}
              >
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.eyebrow, { color: accent }]}>
              {destructive
                ? t('CONFIRMAR ELIMINACIÓN')
                : dialog.onConfirm
                  ? t('TODO LISTO')
                  : t('ESTAMOS AQUÍ PARA AYUDARTE')}
            </Text>
            <Text accessibilityRole="header" style={styles.title}>
              {t(dialog.title)}
            </Text>
            <Text style={styles.message}>{t(dialog.message)}</Text>
            {error ? (
              <View style={styles.errorBox}>
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  style={styles.error}
                >
                  {t(error)}
                </Text>
              </View>
            ) : null}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={confirm}
              style={({ pressed }) => [
                styles.confirm,
                { backgroundColor: accent },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              {busy ? <ActivityIndicator color={colors.ink} /> : null}
              <Text style={styles.confirmText}>
                {busy
                  ? t('Guardando cambios…')
                  : (dialog.confirmLabel ?? (dialog.onConfirm ? t('Confirmar') : t('Entendido')))}
              </Text>
            </Pressable>
            {dialog.onConfirm ? (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={close}
                style={styles.cancel}
              >
                <Text style={styles.cancelText}>{t('Cancelar')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: '#020609CC', paddingHorizontal: 16, alignItems: 'center' },
    sheet: {
      width: '100%',
      maxWidth: 460,
      maxHeight: '92%',
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      elevation: 24,
      shadowColor: '#000',
      shadowOpacity: 0.35,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
    },
    accentLine: {
      height: 3,
      width: 56,
      alignSelf: 'center',
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    },
    content: { padding: 24, gap: 12 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    iconBadge: {
      width: 58,
      height: 58,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    close: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
    title: {
      fontSize: 25,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 31,
      letterSpacing: -0.5,
    },
    message: { fontSize: 15, lineHeight: 23, color: colors.textMuted },
    actions: { paddingHorizontal: 24, paddingBottom: 16, gap: 4 },
    confirm: {
      minHeight: 52,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    confirmText: {
      color: colors.ink,
      fontSize: 16,
      fontWeight: '800',
      flexShrink: 1,
      textAlign: 'center',
    },
    cancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    cancelText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
    pressed: { opacity: 0.8 },
    disabled: { opacity: 0.55 },
    errorBox: { backgroundColor: `${colors.danger}10`, borderRadius: 12, padding: 12 },
    error: { color: colors.danger, lineHeight: 20, fontSize: 13 },
  });
