import api from '../api/axios'
import store from '../store/store'
import {login,logout} from '../store/Slices/authSlice'

export const refreshAccessToken= async()=>{
    try {
        const response= await api.post('/user/refresh-token')
        const {accessToken,refreshToken,user}=response.data.data
        localStorage.setItem('token',accessToken);
        if (user) {
            localStorage.setItem('user',JSON.stringify(user));
        }
        store.dispatch(login({user,accessToken}))
        return accessToken;
    } catch (error) {
        store.dispatch(logout())
        throw error;
    }
}