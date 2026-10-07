import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';

import SegmentBubble from '../components/SegmentBubble';
import { deleteConversation, getConversation } from '../services/conversationService';

const SPEECH_LANGUAGE = 'es-ES';

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

// onBack() vuelve al historial; onDeleted() se llama tras borrar la conversación.
// Ambas las conectará la navegación (AppNavigator).
export default function ConversacionScreen({ conversationId, onBack, onDeleted }) {
  const [conversation, setConversation] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadConversation = useCallback(async () => {
    try {
      setError(null);
      const data = await getConversation(conversationId);
      setConversation(data.conversation);
      setSegments(data.segments);
    } catch (err) {
      setError('No se pudo cargar la conversación.');
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    loadConversation().finally(() => setLoading(false));
    // Al salir de la pantalla se corta cualquier voz en curso.
    return () => Speech.stop();
  }, [loadConversation]);

  const handlePlay = (segment) => {
    Speech.stop();
    Speech.speak(segment.translatedText, { language: SPEECH_LANGUAGE });
  };

  const handleDelete = () => {
    Alert.alert(
      'Borrar conversación',
      'Se eliminará la conversación y todas sus frases. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteConversation(conversationId);
              if (onDeleted) onDeleted();
            } catch (err) {
              setDeleting(false);
              Alert.alert('Error', 'No se pudo borrar la conversación.');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.backText}>‹ Historial</Text>
      </Pressable>
      <Text style={styles.title}>
        {conversation ? formatDate(conversation.startedAt) : 'Conversación'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPadding}>{renderHeader()}</View>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPadding}>{renderHeader()}</View>
        <View style={styles.center}>
          <Text style={styles.message}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              loadConversation().finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={segments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <SegmentBubble segment={item} onPlay={handlePlay} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.message}>Esta conversación no tiene frases.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
      <Pressable
        style={[styles.deleteButton, deleting && styles.deleteDisabled]}
        onPress={handleDelete}
        disabled={deleting}
      >
        <Text style={styles.deleteText}>
          {deleting ? 'Borrando...' : 'Borrar conversación'}
        </Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 56,
  },
  header: {
    marginBottom: 16,
  },
  headerPadding: {
    paddingHorizontal: 16,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  deleteDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 16,
  },
});
