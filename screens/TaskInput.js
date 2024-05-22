import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View } from 'react-native';

export default function TaskInput({ addTask }) {
  const [text, setText] = useState('');

  const onDeleteTask = (index) => {
    // Créez une copie de la liste des tâches
    const updatedTasks = [...tasks];
    // Supprimez la tâche à l'index donné
    updatedTasks.splice(index, 1);
    // Mettez à jour la liste des tâches avec la nouvelle liste sans la tâche supprimée
    setTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={text}
        onChangeText={(value) => setText(value)}
      />
      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
