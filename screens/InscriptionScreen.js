// InscriptionScreen.js
import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InscriptionScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    try {
      // Vérifier si les mots de passe correspondent
      if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
      else{
        navigation.navigate('Login');
      }
  
      // Envoyer les données d'inscription au serveur
      const response = await fetch('https://votre-api.com/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });
  
      // Vérifier la réponse du serveur
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Erreur lors de l\'inscription');
      }
  
      // Si l'inscription réussit, rediriger l'utilisateur vers un autre écran
      navigation.navigate('Login');
  
      // Afficher un message de succès
      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
  
    } catch (error) {
      // En cas d'erreur, afficher un message d'erreur
      alert(error.message || 'Une erreur s\'est produite lors de l\'inscription.');
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscrivez-vous</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(value) => setUsername(value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(value) => setEmail(value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(value) => setPassword(value)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(value) => setConfirmPassword(value)}
        secureTextEntry
      />
      <Button title="S'inscrire" onPress={handleSignUp} color="#ffc0cb" />
      <TouchableOpacity onPress={handleLoginRedirect}>
        <Text style={styles.signInText}>Vous avez déjà un compte? <Text style={styles.blueText}>Connectez-vous</Text></Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black', // Couleur du texte noir
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  signInText: {
    marginTop: 10,
    fontSize: 12,
    color: 'black', // Couleur du texte noir pour le texte principal
  },
  blueText: {
    color: '#007bff', // Couleur bleue pour "Connectez-vous"
  },
});

export default InscriptionScreen;
