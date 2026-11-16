import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import TaskList from './TaskList';

const BoardScreen = ({ navigation }) => {
  const [boardName, setBoardName] = useState('');
  const [boards, setBoards] = useState([]);

  const handleAddBoard = () => {
    if (boardName.trim()) {
      const newBoard = { id: boards.length + 1, name: boardName };
      setBoards([...boards, newBoard]);
      setBoardName('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boards</Text>
      <ScrollView horizontal contentContainerStyle={styles.scrollViewContainer}>
        {boards.map(board => (
          <TouchableOpacity key={board.id} style={styles.boardItem} onPress={() => navigation.navigate('TaskList')}>
            <Text style={styles.boardName}>{board.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Board Name"
          value={boardName}
          onChangeText={(value) => setBoardName(value)}
        />
        <Button title="Add Board" onPress={handleAddBoard} color="#ffc0cb"/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '70%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  boardItem: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  boardName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BoardScreen;
