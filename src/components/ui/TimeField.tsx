import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextInput } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { isValidTime } from '../../utils/dates';

interface TimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  accessibilityLabel?: string;
}

function toDate(value: string): Date {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

function toTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function TimeField({ value, onChange, minuteInterval = 5, accessibilityLabel }: TimeFieldProps) {
  const { colors, typography, themeName } = useTheme();
  const { language } = useTranslation();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={toDate(value)}
        mode="time"
        display="compact"
        minuteInterval={minuteInterval}
        themeVariant={themeName}
        accentColor={colors.accent}
        locale={language === 'fr' ? 'fr-FR' : 'en-US'}
        accessibilityLabel={accessibilityLabel}
        onChange={(_, date) => {
          if (date) onChange(toTime(date));
        }}
      />
    );
  }

  if (Platform.OS === 'android') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() =>
          DateTimePickerAndroid.open({
            value: toDate(value),
            mode: 'time',
            is24Hour: true,
            onChange: (_, date) => {
              if (date) onChange(toTime(date));
            },
          })
        }
        style={{ backgroundColor: colors.bg.tertiary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <Text style={typography.body}>{value}</Text>
      </Pressable>
    );
  }

  return (
    <TextInput
      value={draft}
      accessibilityLabel={accessibilityLabel}
      onChangeText={(text) => {
        setDraft(text);
        if (isValidTime(text)) onChange(text);
      }}
      onBlur={() => setDraft(value)}
      placeholder="08:00"
      placeholderTextColor={colors.text.placeholder}
      maxLength={5}
      style={[
        typography.body,
        {
          backgroundColor: colors.bg.tertiary,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          width: 76,
          textAlign: 'center',
        },
      ]}
    />
  );
}
