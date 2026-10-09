import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Proximamente from '../components/Proximamente';
import { useUser } from '../context/UserContext';
import {
  AjustesScreen,
  BienvenidaScreen,
  ConversacionScreen,
  HistorialScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563eb',
    background: '#fff',
  },
};

// Las tres pestañas (ARQUITECTURA.md §5). Traducir e Historial son de otros
// bloques, así que esperan con un relleno hasta que lleguen sus pantallas.
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen name="Traducir">
        {() => (
          <Proximamente
            titulo="Traducir"
            descripcion="La traducción en vivo llega en la próxima tarea."
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Historial" options={{ headerShown: false }}>
        {({ navigation }) => (
          <HistorialScreen
            onSelectConversation={(conversation) =>
              navigation.navigate('Conversacion', { conversationId: conversation._id })
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Ajustes" component={AjustesScreen} />
    </Tab.Navigator>
  );
}

// Decide qué se ve según el usuario (ARQUITECTURA.md §5):
// sin usuario → Bienvenida. Con usuario → las tres pestañas.
// El detalle (ConversacionScreen) vive en el stack raíz, fuera de las pestañas.
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
    return (
      <NavigationContainer theme={tema}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
        ) : (
          <>
            <Stack.Screen name="App" component={AppTabs} />
            <Stack.Screen name="Conversacion">
              {({ navigation, route }) => (
                <ConversacionScreen
                  conversationId={route.params.conversationId}
                  onBack={navigation.goBack}
                  onDeleted={navigation.goBack}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
