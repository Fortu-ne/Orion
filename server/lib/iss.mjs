import axios from "axios";
import dotenv from 'dotenv'

dotenv.config()

const iss = axios.create({
    baseURL:'http://api.open-notify.org/iss-now.json',
   
})

export default iss;