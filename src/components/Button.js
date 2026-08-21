import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import theme from '../theme';

export default function Button({ title, onPress, variant = 'primary', disabled }) {
    return (
        <Pressable 
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.base,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                pressed && styles.pressed,
                disabled && styles.disabled
            ]}
        >
            <Text style={[
                styles.label, 
                variant === 'secondary' && styles.labelSecondary, 
                disabled && styles.labelDisabled
                ]}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: theme.colors.brand,
    },
    secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    pressed: {
        opacity: 0.75,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: theme.colors.textMuted,    
    },
    label: {
        ...theme.type.body,
        color: theme.colors.surface,
    },
    labelSecondary: {
        color: theme.colors.text,
    },
    labelDisabled: {
        color: theme.colors.surface,
    },
});