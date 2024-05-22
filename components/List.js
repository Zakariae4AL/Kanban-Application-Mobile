import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';

const List = () => {
  return (
    <View style={styles.list}>
      <Text style={styles.listTitle}>List</Text>
      <Card />
      <TouchableOpacity style={styles.addButton}>
        <Text>Add Card</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#fff',
    marginRight: 10,
    padding: 10,
    borderRadius: 5,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
});

export default List;
