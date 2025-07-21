// location/_layout.tsx
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import CustomTabBar from '@/components/CustomTabBar';

export default function WorksiteLayout() {
	return (
		<View style={styles.container}>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen
					name="[id]"
					options={{
						title: "Location Detail",
					}}
				/>
			</Stack>
			<CustomTabBar />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});