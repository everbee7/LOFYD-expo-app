import { Stack, router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function WorksiteLayout() {
	return (
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
	);
}


const styles = StyleSheet.create({
	backButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 2,
		marginRight: 16,
	},
});