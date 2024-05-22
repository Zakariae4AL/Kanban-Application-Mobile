import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NEXT_PUBLIC_BACKEND_URL = 'http://your-backend-url'; // Replace with your backend URL
const root = 'api'; // Replace with your API root if needed

export async function SigninUser(data) {
  try {
    const url = `${NEXT_PUBLIC_BACKEND_URL}/${root}/signin`;
    console.log(url);
    const response = await axios.post(url, data);
    console.log("token : ", response.data.data);
    // Store the token in AsyncStorage
    await AsyncStorage.setItem('token', response.data.data);

    return response;
  } catch (error) {
    throw error;
  }
}
