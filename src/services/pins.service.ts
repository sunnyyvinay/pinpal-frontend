import axios from 'axios';

const apiUrl = "http://localhost:3000/api/user";

interface Pin {
    lat_long: number[],
    title: string,
    caption: string | undefined,
    create_date: Date,
    edit_date: Date | undefined,
    photos: string[] | undefined,
    location_tags: string[] | undefined,
    user_tags: string[] | undefined
}

// ADD PIN
export const addPin = async (id: string, pin: Pin) => {
    try {
      const response = await axios.post(`${apiUrl}/${id}/add`, pin);
      return response.data;
    } catch (error) {
      return error;
    }
  };
  
// UPDATE PIN INFO
export const updatePin = async (userid: string, pinid: string, pin: Pin) => {
  try {
      const response = await axios.put(`${apiUrl}/${userid}/pin/${pinid}/update`, pin);
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
