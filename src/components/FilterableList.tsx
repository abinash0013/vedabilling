import React from 'react';
import {View, Text, FlatList, StyleSheet, ViewStyle} from 'react-native';
import SearchBar from './SearchBar';
import SkeletonLoader from './SkeletonLoader';
import COLORS from '../constants/colors';

interface FilterableListProps<T> {
  data: T[];
  searchValue: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder?: string;
  searchKeys?: (keyof T & string)[];
  filterFn?: (item: T, query: string) => boolean;
  keyExtractor?: (item: T) => string;
  renderItem: (item: T, index: number, isLast: boolean) => React.ReactElement;
  loading?: boolean;
  skeletonCount?: number;
  emptyIcon?: React.ReactElement;
  emptyTitle?: string;
  emptySub?: string;
  searchStyle?: ViewStyle;
  listStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  children?: React.ReactNode;
}

export default function FilterableList<T extends Record<string, any>>({
  data,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchKeys,
  filterFn,
  keyExtractor = (item: any) => item.id ?? item.key ?? item.reg ?? String(item),
  renderItem,
  loading = false,
  skeletonCount = 5,
  emptyIcon,
  emptyTitle = 'No items found',
  emptySub,
  searchStyle,
  listStyle,
  contentContainerStyle,
  children,
}: FilterableListProps<T>) {
  const filtered = searchValue.trim()
    ? data.filter(item =>
        filterFn
          ? filterFn(item, searchValue.toLowerCase())
          : searchKeys?.some(key =>
              String(item[key] ?? '')
                .toLowerCase()
                .includes(searchValue.toLowerCase()),
            ) ?? false,
      )
    : data;

  if (loading) {
    return <SkeletonLoader count={skeletonCount} />;
  }

  return (
    <>
      <SearchBar
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder}
        style={[styles.searchMargin, searchStyle]}
      />
      {children}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        style={styles.flatList}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.listEmpty,
          contentContainerStyle,
          listStyle,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) =>
          renderItem(item, index, index === filtered.length - 1)
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {emptyIcon && <View style={styles.emptyIcon}>{emptyIcon}</View>}
            <Text style={styles.emptyTitle}>
              {searchValue.trim() ? 'No results match your search' : emptyTitle}
            </Text>
            {emptySub && (
              <Text style={styles.emptySub}>
                {searchValue.trim()
                  ? 'Try a different search term'
                  : emptySub}
              </Text>
            )}
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchMargin: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
    gap: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
