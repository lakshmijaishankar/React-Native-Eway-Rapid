import React, { useMemo, memo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { creditCardType } from 'card-validator';

interface CardCvnProps extends TextInputProps {
  cardType?: string;
}

const CardCvn = React.forwardRef<TextInput, CardCvnProps>((props, ref) => {
  const {
    placeholder = 'CVN',
    inputMode = 'numeric',
    secureTextEntry = true,
    style,
    placeholderTextColor = '#000000',
    cardType = '',
    maxLength,
    ...rest
  } = props;

  const typeInfo = useMemo(() => creditCardType.getTypeInfo(cardType), [cardType]);

  if (__DEV__) {
    console.log(
      '%ctypeInfo',
      'background-color: #0573FF; color:#fff; padding: 6px; border-radius: 4px',
      typeInfo,
    );
  }

  return (
    <>
      <TextInput
        placeholder={placeholder}
        inputMode={inputMode}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength ?? typeInfo?.code?.size}
        placeholderTextColor={placeholderTextColor}
        style={[cardCvnStyleSheet.cardCvn, style]}
        keyboardType="number-pad"
        ref={ref}
        {...rest}
      />
    </>
  );
});

const cardCvnStyleSheet = StyleSheet.create({
  cardCvn: {
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

export default memo(CardCvn);
