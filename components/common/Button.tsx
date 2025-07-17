// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
	size?: 'small' | 'medium' | 'large';
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
	title,
	onPress,
	disabled = false,
	loading = false,
	variant = 'primary',
	size = 'medium',
	leftIcon,
	rightIcon,
	style,
	textStyle,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	
	const getButtonStyle = () => {
		const baseStyle = [styles.button, styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]];

		switch (variant) {
			case 'primary':
				baseStyle.push(styles.buttonPrimary);
				break;
			case 'secondary':
				baseStyle.push(styles.buttonSecondary);
				break;
			case 'outline':
				baseStyle.push(styles.buttonOutline);
				break;
			case 'ghost':
				baseStyle.push(styles.buttonGhost);
				break;
		}

		if (disabled || loading) {
			baseStyle.push(styles.buttonDisabled);
		}

		return baseStyle;
	};

	const getTextStyle = () => {
		const baseStyle = [styles.buttonText, styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]];

		switch (variant) {
			case 'primary':
				baseStyle.push(styles.buttonTextPrimary);
				break;
			case 'secondary':
				baseStyle.push(styles.buttonTextSecondary);
				break;
			case 'outline':
				baseStyle.push(styles.buttonTextOutline);
				break;
			case 'ghost':
				baseStyle.push(styles.buttonTextGhost);
				break;
		}

		if (disabled || loading) {
			baseStyle.push(styles.buttonTextDisabled);
		}

		return baseStyle;
	};

	const getIconSpacing = () => {
		switch (size) {
			case 'small':
				return theme.spacing.xs;
			case 'medium':
				return theme.spacing.sm;
			case 'large':
				return theme.spacing.sm;
			default:
				return theme.spacing.sm;
		}
	};

	return (
		<TouchableOpacity
			style={[...getButtonStyle(), style]}
			onPress={onPress}
			disabled={disabled || loading}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={variant === 'primary' || variant === 'secondary' ? '#ffffff' : theme.colors.primary}
				/>
			) : (
				<View style={styles.buttonContent}>
					{leftIcon && (
						<View style={[styles.iconContainer, { marginRight: getIconSpacing() }]}>
							{leftIcon}
						</View>
					)}
					
					<Text style={[...getTextStyle(), textStyle]}>
						{title}
					</Text>
					
					{rightIcon && (
						<View style={[styles.iconContainer, { marginLeft: getIconSpacing() }]}>
							{rightIcon}
						</View>
					)}
				</View>
			)}
		</TouchableOpacity>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: theme.borderRadius.lg,
		flexDirection: 'row',
	},

	// Button content container
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},

	// Icon container
	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	// Size variants
	buttonSmall: {
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		minHeight: 40,
	},
	buttonMedium: {
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		minHeight: 48,
	},
	buttonLarge: {
		paddingVertical: theme.spacing.md + 2,
		paddingHorizontal: theme.spacing.lg,
		minHeight: 56,
	},

	// Color variants
	buttonPrimary: {
		backgroundColor: theme.colors.primary,
		...theme.shadows.md,
	},
	buttonSecondary: {
		backgroundColor: theme.colors.secondary,
		...theme.shadows.md,
	},
	buttonOutline: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: theme.colors.primary,
	},
	buttonGhost: {
		backgroundColor: '#e3e7e2ff',
	},
	buttonDisabled: {
		backgroundColor: theme.colors.primary,
		opacity: 0.6,
	},

	// Text styles
	buttonText: {
		...theme.typography.button,
		textAlign: 'center',
	},
	buttonTextSmall: {
		fontSize: 14,
	},
	buttonTextMedium: {
		fontSize: 16,
	},
	buttonTextLarge: {
		fontSize: 16,
		fontWeight: '600',
	},

	// Text color variants
	buttonTextPrimary: {
		color: '#ffffff',
	},
	buttonTextSecondary: {
		color: '#ffffff',
	},
	buttonTextOutline: {
		color: theme.colors.primary,
	},
	buttonTextGhost: {
		color: theme.colors.primary,
	},
	buttonTextDisabled: {
		color: '#ffffff',
	},
});

export default Button;