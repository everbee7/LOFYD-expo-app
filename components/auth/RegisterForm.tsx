import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

// Import validation utils
import { validateEmail, validatePassword } from '../../utils/validation';

interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  zipCode: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onRegister: (data: RegisterFormData) => Promise<void>;
  onNavigateToLogin: () => void;
  loading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onNavigateToLogin,
  loading = false
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Error states
  const [emailError, setEmailError] = useState<string>('');
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [zipCodeError, setZipCodeError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  const styles = createStyles(theme);

  const handleSignUp = async (): Promise<void> => {
    // Reset errors
    setEmailError('');
    setFirstNameError('');
    setLastNameError('');
    setZipCodeError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validation
    let hasError = false;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    // First name validation
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      hasError = true;
    }

    // Last name validation
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      hasError = true;
    }

    // Zipcode validation
    if (!zipCode.trim()) {
      setZipCodeError('Home zipcode is required');
      hasError = true;
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    await onRegister({
      email,
      firstName,
      lastName,
      zipCode,
      password,
      confirmPassword
    });
  };

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Join for great specials and a good{'\n'}time with local restaurants.
        </Text>
      </View>

      {/* Form Inputs */}
      <View style={styles.formSection}>
        {/* Email Input */}
        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
        />

        {/* First Name Input */}
        <Input
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoComplete="given-name"
          error={firstNameError}
        />

        {/* Last Name Input */}
        <Input
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoComplete="family-name"
          error={lastNameError}
        />

        {/* Home Zipcode Input */}
        <Input
          placeholder="Home Zipcode"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
          autoComplete="postal-code"
          maxLength={10}
          error={zipCodeError}
        />

        {/* Password Input */}
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
          error={passwordError}
        />

        {/* Confirm Password Input */}
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
          error={confirmPasswordError}
        />

        {/* Sign Up Button */}
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          variant="primary"
          leftIcon={<Ionicons name="person-add-outline" size={18} color={theme.colors.background} />}
          style={styles.signUpButton}
        />

        {/* Log In Link */}
        <View style={styles.logInSection}>
          <Text style={styles.logInText}>Have an account? </Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.logInLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    color: theme.colors.text,
    fontSize: theme.spacing.xl || 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginTop: theme.spacing.md,
  },
  signUpButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  logInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logInText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  logInLink: {
    ...theme.typography.body,
    color: theme.colors.black || theme.colors.textBlack || theme.colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default RegisterForm;