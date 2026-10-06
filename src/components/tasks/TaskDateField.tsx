import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { dateKey, parseDateKey, relativeDay, shiftDateKey } from '../../utils/dates';
import { formatLongDate } from '../../utils/time';
import { hapticLight } from '../../utils/haptics';
import { Chip } from '../ui/List';

interface TaskDateFieldProps {
  value: string;
  onChange: (date: string) => void;
}

/** Today / tomorrow cover almost every case; the picker handles the rest. */
export function TaskDateField({ value, onChange }: TaskDateFieldProps) {
  const { colors, themeName } = useTheme();
  const { t, language } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);

  const today = dateKey();
  const tomorrow = shiftDateKey(today, 1);
  const relative = relativeDay(value, today);
  const isCustom = relative !== 'today' && relative !== 'tomorrow';

  const select = (date: string) => {
    hapticLight();
    onChange(date);
  };

  const openPicker = () => {
    hapticLight();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseDateKey(value),
        mode: 'date',
        onChange: (_, date) => {
          if (date) onChange(dateKey(date));
        },
      });
      return;
    }
    setPickerVisible((visible) => !visible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        <Chip
          label={t('Aujourd’hui')}
          selected={relative === 'today'}
          onPress={() => select(today)}
        />
        <Chip
          label={t('Demain')}
          selected={relative === 'tomorrow'}
          onPress={() => select(tomorrow)}
        />
        <Chip
          label={isCustom ? formatLongDate(parseDateKey(value), t) : t('Plus tard…')}
          selected={isCustom}
          onPress={openPicker}
        />
      </View>

      {pickerVisible && Platform.OS !== 'android' && (
        <DateTimePicker
          value={parseDateKey(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          themeVariant={themeName}
          accentColor={colors.accent}
          locale={language === 'fr' ? 'fr-FR' : 'en-US'}
          accessibilityLabel={t('Date de la tâche')}
          onChange={(_, date) => {
            if (date) onChange(dateKey(date));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
