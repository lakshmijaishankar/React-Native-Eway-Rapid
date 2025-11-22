import React, { memo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface CardMonthProps extends TextInputProps {}

const CardMonth = React.forwardRef<TextInput, CardMonthProps>((props, ref) => {
  const {
    placeholder = 'MM',
    inputMode = 'numeric',
    style,
    placeholderTextColor = '#000000',
    maxLength = 2,
    ...rest
  } = props;
  const value = rest.value;

  if (__DEV__) {
    console.log(
      '%cCardMonth',
      'background-color: #0573FF; color:#fff; padding: 6px; border-radius: 4px',
      props.value,
    );
  }

  return (
    <TextInput
      placeholder={placeholder}
      inputMode={inputMode}
      maxLength={maxLength}
      placeholderTextColor={placeholderTextColor}
      style={[cardMonthStyleSheet.cardMonth, style]}
      ref={ref}
      {...rest}
      {...(value && { value: Number(value) > 12 ? value.slice(0, 1) : value })}
    />
  );
});

const cardMonthStyleSheet = StyleSheet.create({
  cardMonth: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 8,
    minHeight: 48,
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
  },
});

export default memo(CardMonth);
