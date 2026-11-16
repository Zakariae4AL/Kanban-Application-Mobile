import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Card = () => {
  return (
    <TouchableOpacity style={styles.card}>
      <Text>Card</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default Card;
