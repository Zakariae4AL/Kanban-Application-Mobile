import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Modal, ScrollView, Picker } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState('todo');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskStatus, setEditTaskStatus] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask = { id: tasks.length + 1, text: newTaskText, status: 'todo' };
      setTasks([newTask, ...tasks]);
      setNewTaskText('');
    }
  };

  const handleDragEnd = ({ data }) => {
    setTasks(data);
  };

  const handleEditTask = (taskId, status) => {
    setTasks(tasks.map(task => (task.id === taskId ? { ...task, status } : task)));
    setEditTaskId(null);
  };

  const renderTask = ({ item, drag }) => (
    <TouchableOpacity style={styles.task} onLongPress={drag}>
      <Text style={styles.taskText}>{item.text}</Text>
      <Button title="Edit" onPress={() => { setEditTaskId(item.id); setEditTaskStatus(item.status); }} />
      {editTaskId === item.id && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={editTaskStatus}
            style={styles.picker}
            onValueChange={(itemValue) => setEditTaskStatus(itemValue)}
          >
            <Picker.Item label="To Do" value="todo" />
            <Picker.Item label="Doing" value="doing" />
            <Picker.Item label="Done" value="done" />
          </Picker>
          <Button title="Save" onPress={() => handleEditTask(item.id, editTaskStatus)} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderColumn = (title, status) => {
    const columnTasks = tasks.filter(task => task.status === status);

    return (
      <View style={styles.column}>
        <Text style={styles.columnTitle}>{title}</Text>
        <DraggableFlatList
          data={columnTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id.toString()}
          onDragEnd={handleDragEnd}
        />
      </View>
    );
  };

  const openModal = (column) => {
    setActiveColumn(column);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kanban</Text>
      <View style={styles.addTaskContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Task"
          value={newTaskText}
          onChangeText={setNewTaskText}
        />
        <Button title="Add Task" onPress={handleAddTask} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="To Do" onPress={() => openModal('todo')} />
        <Button title="Doing" onPress={() => openModal('doing')} />
        <Button title="Done" onPress={() => openModal('done')} />
      </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Button title="Close" onPress={() => setModalVisible(false)} />
          <ScrollView>
            {activeColumn === 'todo' && renderColumn('To Do', 'todo')}
            {activeColumn === 'doing' && renderColumn('Doing', 'doing')}
            {activeColumn === 'done' && renderColumn('Done', 'done')}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  column: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginVertical: 10,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  task: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  picker: {
    flex: 1,
  },
});

export default TaskList;
