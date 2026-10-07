import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { getConversations } from '../services/conversationService';

const formatDate = (value) => {
  const date = new Date(value);
  const day = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} · ${time}`;
};

const formatSegments = (conversation) => {
  if (!conversation.endedAt) return 'En curso';
  const count = conversation.segmentCount;
  return count === 1 ? '1 frase' : `${count} frases`;
};

// onSelectConversation(conversation) lo conectará la navegación hacia ConversacionScreen.
export default function HistorialScreen({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      setConversations(await getConversations());
    } catch (err) {
      setError('No se pudo cargar el historial.');
    }
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleRetry = async () => {
    setLoading(true);
    await loadConversations();
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onSelectConversation && onSelectConversation(item)}
    >
      <View style={styles.contenedoresCard}>
        <Text style={styles.cardDate}>{formatDate(item.startedAt)}</Text>
        <Text style={styles.cardSegments}>{formatSegments(item)}</Text>
      </View>
      <View style={styles.contenedoresCard2}>
        <Text style={styles.details}> Detalles </Text>
      </View>
    </Pressable>
  );

  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.message}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Aún no tienes conversaciones.</Text>
        <Text style={styles.hint}>Cuando traduzcas una, aparecerá aquí.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.list}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
    paddingTop: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12,
    textAlign: "center",
    color: "#E8EAF2",
    marginBottom: 50,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#353944',
    borderRadius: 25,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    padding: 16,
    paddingLeft: 30,
    marginBottom: 10,
    flexDirection: 'row',
  },
  cardPressed: {
    opacity: 0.6,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8EAF2'
  },
  cardSegments: {
    fontSize: 14,
    color: '#9AA3B8',
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,

  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  details: {
    color: '#6C8CFF',
    fontSize: 16,
  },
  contenedoresCard: {
    width: '60%',
  },
  contenedoresCard2: {
    width: '40%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
