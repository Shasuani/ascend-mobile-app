// The Library (Intelligence) — personalized book recommendations, a reading
// tracker, and finished-book records. Finishing a book awards INT XP.

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, space, ATTRS, ATTR_ORDER } from '../theme/tokens';
import { Title, Label, Txt, Num } from '../components/typography';
import SystemWindow from '../components/SystemWindow';
import XpBar from '../components/XpBar';
import BookCard from '../components/BookCard';
import { useStore } from '../state/StoreContext';
import { recommendBooks, booksByDomain } from '../logic/recommendations';
import { bookById } from '../data/books';

function ReadingItem({ book, entry, onLog, onFinish, onRemove }) {
  const pct = entry.pages ? entry.pagesRead / entry.pages : 0;
  const almost = pct >= 1;
  return (
    <View style={styles.reading}>
      <View style={styles.readHead}>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 15 }}>{book.title}</Txt>
          <Label color={colors.muted} style={{ marginTop: 2 }}>{book.author}</Label>
        </View>
        <Pressable onPress={onRemove} hitSlop={10}><Txt color={colors.muted}>✕</Txt></Pressable>
      </View>

      <View style={{ marginTop: space.sm }}>
        <XpBar pct={pct} height={6} />
        <Num color={colors.muted} style={{ fontSize: 11, marginTop: 4 }}>
          {entry.pagesRead} / {entry.pages} pages
        </Num>
      </View>

      <View style={styles.readBtns}>
        <Pressable onPress={onLog} style={[styles.smallBtn, { borderColor: colors.line, borderWidth: 1 }]}>
          <Label color={colors.cyan}>+25 pages</Label>
        </Pressable>
        <Pressable onPress={onFinish} style={[styles.smallBtn, { backgroundColor: almost ? colors.cyan : colors.cyanDeep }]}>
          <Label color={almost ? colors.void : colors.cyan}>Finish · +{book.xp} INT</Label>
        </Pressable>
      </View>
    </View>
  );
}

export default function Library() {
  const { state, actions } = useStore();
  const shelf = state.library?.shelf || {};
  const shelfIds = Object.keys(shelf);

  const reading = shelfIds.filter((id) => !shelf[id].finished).map((id) => ({ id, book: bookById(id), entry: shelf[id] })).filter((x) => x.book);
  const finished = shelfIds.filter((id) => shelf[id].finished).map((id) => bookById(id)).filter(Boolean);

  const recommended = recommendBooks(state.profile, shelfIds, 5);
  const byDomain = booksByDomain(shelfIds);

  const bookState = (id) => (shelf[id]?.finished ? 'finished' : shelf[id] ? 'reading' : 'add');

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Label color={colors.cyanDim}>Intelligence</Label>
      <Title style={{ marginTop: 2 }}>The Library</Title>
      <Txt color={colors.muted} style={{ marginTop: 4 }}>
        Reading is training for the mind. Every book cleared grants Intelligence XP.
      </Txt>

      {/* Currently reading */}
      {reading.length > 0 && (
        <SystemWindow style={styles.block} scan={false}>
          <Label style={{ marginBottom: space.sm }}>Currently Reading</Label>
          {reading.map(({ id, book, entry }) => (
            <ReadingItem
              key={id}
              book={book}
              entry={entry}
              onLog={() => actions.logReading(id)}
              onFinish={() => actions.finishBook(book)}
              onRemove={() => actions.removeBook(id)}
            />
          ))}
        </SystemWindow>
      )}

      {/* Recommendations */}
      <View style={styles.block}>
        <Label style={{ marginBottom: space.sm }}>Recommended for you</Label>
        {recommended.length === 0 && <Txt color={colors.muted}>Every book is on your shelf. Impressive.</Txt>}
        {recommended.map((b) => (
          <BookCard key={b.id} book={b} state={bookState(b.id)} onAdd={() => actions.addBook(b)} />
        ))}
      </View>

      {/* Browse by domain */}
      {ATTR_ORDER.filter((d) => byDomain[d]?.length).map((d) => (
        <View key={d} style={styles.block}>
          <Label color={ATTRS[d].accent} style={{ marginBottom: space.sm }}>
            {ATTRS[d].label} · {ATTRS[d].domain}
          </Label>
          {byDomain[d].map((b) => (
            <BookCard key={b.id} book={b} state={bookState(b.id)} onAdd={() => actions.addBook(b)} />
          ))}
        </View>
      ))}

      {/* Finished */}
      {finished.length > 0 && (
        <SystemWindow style={styles.block} scan={false} accent={colors.gold}>
          <Label color={colors.gold} style={{ marginBottom: space.sm }}>Cleared ({finished.length})</Label>
          {finished.map((b) => (
            <View key={b.id} style={styles.finRow}>
              <Txt color={colors.muted} style={{ flex: 1 }}>✓ {b.title}</Txt>
              <Num color={colors.gold} style={{ fontSize: 12 }}>+{b.xp}</Num>
            </View>
          ))}
        </SystemWindow>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.md, paddingTop: space.sm },
  block: { marginTop: space.xl },
  reading: { paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: colors.line2 },
  readHead: { flexDirection: 'row', alignItems: 'flex-start' },
  readBtns: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  smallBtn: { borderRadius: 4, paddingVertical: 8, paddingHorizontal: space.md, alignItems: 'center' },
  finRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
