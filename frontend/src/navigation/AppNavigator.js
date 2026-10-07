import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { BienvenidaScreen, HomeScreen } from '../screens';

// Decide qué se ve según el usuario (ARQUITECTURA.md §5):
// sin usuario → Bienvenida. Con usuario → la app (Traducir por ahora).
export default function AppNavigator() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return <BienvenidaScreen />;
  }

  // Temporal: aquí entran las tres pestañas cuando esté instalada la navegación.
  return <HomeScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
