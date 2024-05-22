import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SigninUser } from '../api/api.js'; // Import the SigninUser function

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (username.trim() && password.trim()) {
      try {
        const response = await SigninUser({ username, password });
        // If login is successful, navigate to the Board screen
        navigation.navigate('Board');
      } catch (error) {
        // Handle login error here
        alert('Erreur de connexion. Veuillez réessayer.');
      }
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Inscription');
  };

  return (
    <View style={styles.container}>
      <View style={styles.rectangle}>
        <Text style={styles.title}>Connectez-vous à votre compte</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(value) => setUsername(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={(value) => setPassword(value)}
          secureTextEntry
        />
        <Button title="Se Connecter" onPress={handleLogin} color="#ffc0cb" />
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpText}>Vous n'avez pas un compte? <Text style={styles.blueText}>Inscrivez-vous</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Couleur de fond gris clair
  },
  rectangle: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black', // Couleur du texte noir
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  signUpText: {
    marginTop: 10,
    fontSize: 12,
    color: 'black', // Couleur du texte noir pour le texte principal
  },
  blueText: {
    color: '#007bff', // Couleur bleue pour "Inscrivez-vous"
  },
});

export default LoginScreen;
