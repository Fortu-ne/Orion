import axios from "axios";
import dotenv from 'dotenv'

dotenv.config()

const nasa = axios.create({
    baseURL:'https://api.nasa.gov',
    params: 
    {
        api_key : process.env.NASA_API_KEY
    }
})

export default nasa;