import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import List from './List';

const Board = () => {
  return (
    <View style={styles.board}>
      <Text style={styles.boardTitle}>Board</Text>
      <List />
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#ccc',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
  },
  boardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default Board;
