import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'; // Assurez-vous d'importer TouchableOpacity
import { AntDesign } from '@expo/vector-icons';
import Draggable from 'react-native-draggable';

export default function Task({ text, onDelete }) {
  return (
    <View style={styles.task}>
      <Text style={styles.taskText}>{text}</Text>
      <TouchableOpacity onPress={onDelete}>
        <AntDesign name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  taskText: {
    fontSize: 16,
  },
}); 