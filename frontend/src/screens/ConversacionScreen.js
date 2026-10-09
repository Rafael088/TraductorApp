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

import { Card, ElevatedCard } from '../components/ui/Card';
import { ErrorState, LoadingState } from '../components/ui/StateViews';
import { deleteConversation, getConversation } from '../services/conversationService';
import { useTheme, globalStyles, typo, css } from '../utils/theme';

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

const SegmentBubble = ({ segment, onPlay, colors, typo }) => (
  <ElevatedCard style={styles.bubble}>
    <Text style={[typo.body, { color: colors.secondaryLabel }]}>{segment.originalText}</Text>
    <View style={styles.translationRow}>
      <Text style={[typo.headline, { color: colors.label, flex: 1 }]}>{segment.translatedText}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.playButton,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => onPlay && onPlay(segment)}
        accessibilityLabel="Reproducir traducción"
        android_ripple={{ color: colors.tint }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.playText}>▶</Text>
      </Pressable>
    </View>
  </ElevatedCard>
);

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
      setError('No se pudo cargar la conversación.');
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
          <SegmentBubble segment={item} onPlay={handlePlay} colors={colors} typo={typoScale} />
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
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF', // Se sobreescribe con theme en el componente
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
});