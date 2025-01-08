import axios from 'axios';

//const apiUrl = "http://localhost:3000/api/user";
const apiUrl = "https://api.pinpal.info/api/user";

interface UserSignup {
    username: string;
    full_name: string;
    pass: string;
    birthday: Date;
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

// CHECK IF USERNAME EXISTS
export const checkUsername = async (username: string) => {
  try {
      const response = await axios.get(`${apiUrl}/username_exists/${username}`);
      return response.data;
  } catch (error) {
      console.log(error);
      return error;
  }
}

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
export const updateUser = async (id: string, user: any) => {
  try {
      const response = await axios.put(`${apiUrl}/${id}/update`, user);
      return response.data;
  } catch (error) {
      return error;
  }
}

// UPDATE USER PROFILE PIC
export const updateUserPic = async (id: string, user: any) => {
  try {
      const response = await axios.put(`${apiUrl}/${id}/update_profile_pic`, user);
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
  create_date: string | undefined,
  photo: string | null,
  location_tags: string[],
  visibility: number,
  user_tags: string[],
}

// ADD PIN
export const addPin = async (id: string, pin: Pin, photo: any) => {
  try {
    const formData = new FormData();

    formData.append('photo', {
      uri: photo,
      type: 'image/jpeg',
      name: id + '.jpg',
    });

    formData.append('latitude', pin.latitude.toString());
    formData.append('longitude', pin.longitude.toString());
    formData.append('title', pin.title);
    formData.append('caption', pin.caption);
    formData.append('create_date', pin.create_date);
    formData.append('user_tags', JSON.stringify(pin.user_tags));
    formData.append('visibility', pin.visibility);
    formData.append('location_tags', JSON.stringify(pin.location_tags));

    const response = await axios.post(`${apiUrl}/${id}/pin/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  create_date: string | undefined,
  photo: string | null,
  location_tags: string[],
  visibility: number,
  user_tags: string[],
}
// UPDATE PIN INFO
export const updatePin = async (userid: string, pinid: string, pin: PinUpdate, photo: any) => {
  try {
    const formData = new FormData();

    formData.append('title', pin.title);
    formData.append('caption', pin.caption);
    formData.append('create_date', pin.create_date);
    formData.append('user_tags', JSON.stringify(pin.user_tags));
    formData.append('visibility', pin.visibility);
    formData.append('location_tags', JSON.stringify(pin.location_tags));

    let headers = {};
    if (photo) {
      headers = {
        'Content-Type': 'multipart/form-data',
      }
      formData.append('photo', {
        uri: photo,
        type: 'image/jpeg',
        name: pinid + '.jpg',
      });
    }
      
      const response = await axios.put(`${apiUrl}/${userid}/pin/${pinid}/update`, formData, { headers });
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

// GET PIN LIKES
export const getPinLikes = async (pinid: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${pinid}/likes`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// ADD PIN LIKE
export const addPinLike = async (userid: string|null, pinid: string) => {
  try {
      const response = await axios.post(`${apiUrl}/${pinid}/user/${userid}/like`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// DELETE PIN LIKE
export const deletePinLike = async (userid: string|null, pinid: string) => {
  try {
      const response = await axios.delete(`${apiUrl}/${pinid}/user/${userid}/unlike`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// GET PUBLIC PINS (randomly chosen for user)
export const getPublicPins = async (userid: string|null) => {
  try {
      const response = await axios.get(`${apiUrl}/${userid}/pins/public`);
      return response.data;
  } catch (error) {
      return error;
  }
};

// GET ALL TAGGED PINS
export const getTaggedPins = async (id: string) => {
  try {
      const response = await axios.get(`${apiUrl}/${id}/pins/tagged`);
      return response.data;
  } catch (error) {
      return error;
  }
};