import axios from 'axios';

const apiUrl = "http://localhost:3000/api/user";

interface User {
    username: string;
    password: string;
    birthday: Date;
    full_name: string;
    email: string;
    phone_no: string;
}

// USER SIGNUP
export const signupUser = async (user: User) => {
    try {
      const response = await axios.post(`${apiUrl}/signup`, user);
      return response.data;
    } catch (error) {
      return error;
    }
  };
  
// USER LOGIN
export const loginUser = async (user: User) => {
    try {
        const response = await axios.post(`${apiUrl}/login`, user);
        return response.data;
    } catch (error) {
        return error;
    }
};