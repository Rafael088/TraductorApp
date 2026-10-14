import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';

import { ErrorState, LoadingState } from '../components/ui/StateViews';
import SegmentBubble from '../components/SegmentBubble';
import { deleteConversation, getConversation } from '../services/conversationService';
import { useTheme, globalStyles } from '../utils/theme';

const SPEECH_LANGUAGE = 'es-ES';

const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ConversacionScreen({ conversationId, onBack, onDeleted }) {
  const { colors, space, shadows, typo: typoScale } = useTheme();
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
      console.warn('Error al cargar la conversación:', err?.message);
      setError(
        `No se pudo cargar la conversación.${err?.message ? ` (${err.message})` : ''}`
      );
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    loadConversation().finally(() => setLoading(false));
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
    <View style={[styles.header, { paddingHorizontal: space[4] }]}>
      <Pressable onPress={onBack} hitSlop={12} android_ripple={{ color: colors.tint }}>
        <Text style={[typoScale.callout, { color: colors.tint }]}>‹ Historial</Text>
      </Pressable>
      <Text style={[typoScale.title2, { color: colors.label, marginTop: space[1] }]}>
        {conversation ? formatDate(conversation.startedAt) : 'Conversación'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[globalStyles.screenBackground, { backgroundColor: colors.systemBackground }]}>
        {renderHeader()}
        <LoadingState message="Cargando conversación…" />
        <StatusBar barStyle={colors.label === '#000000' ? 'dark-content' : 'light-content'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenBackground, { backgroundColor: colors.systemBackground }]}>
        {renderHeader()}
        <ErrorState message={error} onRetry={() => { setLoading(true); loadConversation().finally(() => setLoading(false)); }} />
        <StatusBar barStyle={colors.label === '#000000' ? 'dark-content' : 'light-content'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <FlatList
        data={segments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SegmentBubble segment={item} onPlay={handlePlay} style={styles.bubble} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={[globalStyles.center, { padding: space[6] }]}>
            <Text style={[typoScale.body, { color: colors.tertiaryLabel }]}>Esta conversación no tiene frases.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        style={[
          styles.deleteButton,
          { backgroundColor: colors.systemRed, borderRadius: 16 },
          deleting && { opacity: 0.5 },
        ]}
        onPress={handleDelete}
        disabled={deleting}
        android_ripple={{ color: colors.systemRedPressed }}
      >
        <Text style={[typoScale.callout, { fontWeight: '600', color: colors.systemBackground }]}>
          {deleting ? 'Borrando…' : 'Borrar conversación'}
        </Text>
      </Pressable>
      <StatusBar barStyle={colors.label === '#000000' ? 'dark-content' : 'light-content'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  header: {
    marginBottom: 8,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bubble: {
    marginBottom: 12,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
});