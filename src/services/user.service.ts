import axios from 'axios';

const apiUrl = "http://localhost:3000/api/user";

interface UserSignup {
    username: string;
    full_name: string;
    pass: string;
    birthday: Date;
    email: string | undefined;
    phone_no: string | undefined;
    profile_pic: string | null;
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

interface Pin {
  latitude: number,
  longitude: number,
  title: string,
  caption: string | undefined,
  create_date: Date | undefined,
  edit_date: Date | undefined,
  photos: string[] | undefined,
  location_tags: string[] | undefined,
  visibility: number
}

// ADD PIN
export const addPin = async (id: string, pin: Pin) => {
  try {
    const response = await axios.post(`${apiUrl}/${id}/pin/add`, pin);
    return response.data;
  } catch (error) {
    return error;
  }
};

// GET PIN
export const getPin = async (user_id: string, pin_id: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${user_id}/pin/${pin_id}/info`);
      return response.data;
  } catch (error) {
      return error;
  }
};

interface PinUpdate {
  title: string,
  caption: string | undefined,
  create_date: Date | undefined,
  edit_date: Date | undefined,
  photos: string[] | undefined,
  location_tags: string[] | undefined,
  visibility: number
}
// UPDATE PIN INFO
export const updatePin = async (userid: string, pinid: string, pin: PinUpdate) => {
  try {
      const response = await axios.put(`${apiUrl}/${userid}/pin/${pinid}/update`, pin);
      return response.data;
  } catch (error) {
      return error;
  }
};

interface Location {
  latitude: number,
  longitude: number
}
// UPDATE PIN LOCATION
export const updatePinLocation = async (userid: string, pinid: string, loc: Location) => {
  try {
      const response = await axios.patch(`${apiUrl}/${userid}/pin/${pinid}/update_loc`, loc);
      return response.data;
  } catch (error) {
      return error;
  }
};

// DELETE PIN
export const deletePin = async (userid: string, pinid: string) => {
  try {
      const response = await axios.delete(`${apiUrl}/${userid}/pin/${pinid}/delete`);
      return response.data;
  } catch (error) {
      return error;
  }
}

// GET USER FRIEND REQUESTS
export const getUserRequests = async (userid: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${userid}/requests`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// SEARCH USERS (based on query)
export const getSearchUsers = async (query: string) => {
  try {
      const response = await axios.get(`${apiUrl}/search/${query}`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// GET FRIEND STATUS
export const getFriendStatus = async (sourceid: string|null, targetid: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${sourceid}/request/${targetid}/status`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// CREATE FRIEND REQUEST
export const createFriendRequest = async (sourceid: string|null, targetid: string) => {
  try {
      const response = await axios.post(`${apiUrl}/${sourceid}/request/${targetid}/create`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// ACCEPT FRIEND REQUEST
export const acceptFriendRequest = async (sourceid: string|null, targetid: string|null) => {
  try {
      const response = await axios.patch(`${apiUrl}/${sourceid}/request/${targetid}/accept`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// DELETE FRIEND REQUEST
export const deleteFriendRequest = async (sourceid: string|null, targetid: string) => {
  try {
      const response = await axios.delete(`${apiUrl}/${sourceid}/request/${targetid}/delete`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// GET USER FRIENDS
export const getUserFriends = async (userid: string|null) => {
  try {
      const response = await axios.get(`${apiUrl}/${userid}/friends`);
      return response.data;
  } catch (error) {
      return error;
  }
};