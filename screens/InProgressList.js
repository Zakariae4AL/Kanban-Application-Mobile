// InProgressList.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import Task from './Task';

const InProgressList = ({ tasks, onAddTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      onAddTask(newTask);
      setNewTask('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={newTask}
        onChangeText={text => setNewTask(text)}
      />
      <Button title="Add Task" onPress={handleAddTask} color="#ffc0cb"/>
      {tasks.map(task => (
        <Task key={task.id} text={task.text} onDelete={() => onDeleteTask(task.id)}/>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default InProgressList;
