import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import SearchBar from './SearchBar';
import COLORS from '../constants/colors';

interface FilterableListProps<T> {
  data: T[];
  searchValue: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder?: string;
  filterFn: (item: T, query: string) => boolean;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, isLast: boolean) => React.ReactElement;
  headerTitle: string;
  headerCount?: string;
  emptyText?: string;
  searchStyle?: object;
  listStyle?: object;
}

export default function FilterableList<T>({
  data,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterFn,
  keyExtractor,
  renderItem,
  headerTitle,
  headerCount,
  emptyText = 'No items found',
  searchStyle,
  listStyle,
}: FilterableListProps<T>) {
  const filtered = searchValue.trim()
    ? data.filter(item => filterFn(item, searchValue.toLowerCase()))
    : data;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <Text style={styles.headerSub}>
          {headerCount
            ? headerCount
            : searchValue.trim()
            ? `${filtered.length} of ${data.length}`
            : `${data.length} total`}
        </Text>
      </View>
      <SearchBar
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder}
        style={[styles.searchMargin, searchStyle]}
      />
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        style={{flex: 1}}
        contentContainerStyle={[styles.list, listStyle]}
        renderItem={({item, index}) =>
          renderItem(item, index, index === filtered.length - 1)
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchValue.trim() ? 'No results match your search' : emptyText}
            </Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.headerText,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.headerSub,
    marginTop: 3,
  },
  searchMargin: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
    gap: 14,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
