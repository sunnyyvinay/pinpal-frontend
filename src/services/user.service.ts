import axios from 'axios';

const apiUrl = "http://localhost:3000/api/user";

interface UserSignup {
    username: string;
    full_name: string;
    pass: string;
    birthday: Date;
    email: string | undefined;
    phone_no: string | undefined;
    profile_pic: string | undefined;
}

interface UserLogin {
    username: string;
    pass: string;
}

// USER SIGNUP
export const signupUser = async (user: UserSignup) => {
    try {
      const response = await axios.post(`${apiUrl}/signup`, user);
      return response.data;
    } catch (error) {
      return error;
    }
  };
  
// USER LOGIN
export const loginUser = async (user: UserLogin) => {
    try {
        const response = await axios.post(`${apiUrl}/login`, user);
        return response.data;
    } catch (error) {
        return error;
    }
};

// GET USER INFO
export const getUser = async (id: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${id}/info`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// UPDATE USER INFO
export const updateUser = async (id: string, user: UserSignup) => {
  try {
      const response = await axios.put(`${apiUrl}/${id}/update`, user);
      return response.data;
  } catch (error) {
      return error;
  }
}

// GET USER PINS
export const getPins = async (id: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${id}/pins`);
      return response.data;
  } catch (error) {
      return error;
  }
};