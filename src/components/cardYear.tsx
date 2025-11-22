import React, { memo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface CardYearProps extends TextInputProps {}

const CardYear = React.forwardRef<TextInput, CardYearProps>((props, ref) => {
  const {
    placeholder = 'YYYY',
    inputMode = 'numeric',
    style,
    placeholderTextColor = '#000000',
    maxLength = 4,
    ...rest
  } = props;

  if (__DEV__) {
    console.log(
      '%cCardYear',
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
      style={[cardYearStyleSheet.cardYear, style]}
      ref={ref}
      {...rest}
    />
  );
});

const cardYearStyleSheet = StyleSheet.create({
  cardYear: {
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

export default memo(CardYear);
