import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { Card } from '../components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StateViews';
import { getConversations } from '../services/conversationService';
import { useTheme, globalStyles, typo, css } from '../utils/theme';

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

const formatSegments = (conversation) => {
  if (!conversation.endedAt) return 'En curso';
  const count = conversation.segmentCount;
  return count === 1 ? '1 frase' : `${count} frases`;
};

export default function HistorialScreen({ onSelectConversation }) {
  const { colors, space, shadows } = useTheme();
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

  useFocusEffect(
    useCallback(() => {
      loadConversations().finally(() => setLoading(false));
    }, [loadConversations])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { backgroundColor: colors.tertiarySystemBackground },
      ]}
      onPress={() => onSelectConversation && onSelectConversation(item)}
      android_ripple={{ color: colors.tint }}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardMain}>
          <Text style={[typo.headline, { color: colors.label }]}>{formatDate(item.startedAt)}</Text>
          <Text style={[typo.footnote, { color: colors.secondaryLabel, marginTop: 2 }]}>
            {formatSegments(item)}
          </Text>
        </View>
        <View style={styles.chevron} />
      </View>
    </Pressable>
  );

  const renderEmpty = () => {
    if (error) {
      return <ErrorState message={error} onRetry={async () => { setLoading(true); await loadConversations(); setLoading(false); }} />;
    }
    return (
      <EmptyState
        title="Sin conversaciones"
        description="Cuando traduzcas una, aparecerá aquí."
      />
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.screenBackground, { backgroundColor: colors.systemBackground }]}>
        <LoadingState message="Cargando historial…" />
        <StatusBar barStyle={colors === require('../utils/theme').dark ? 'light-content' : 'dark-content'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      <View style={styles.header}>
        <Text style={[typo.largeTitle, { color: colors.label }]}>Historial</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardMain: { flex: 1 },
  chevron: {
    width: 24,
    height: 24,
    // Se puede poner un ícono SVG aquí
  },
});