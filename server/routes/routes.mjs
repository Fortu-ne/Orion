import { Router } from "express";
import apodRoute from "./apod.mjs"
import issRoute from "./iss.mjs";
import epicRoute from "./epic.mjs"
import marsRoute from "./mars.mjs";
import asteroidsRoute from "./asteroids.mjs";
import launchesRouter from './launches.mjs'


const routes = Router();


routes.use('/api/apod',apodRoute);
routes.use('/api/iss',issRoute);
routes.use('/api/asteroids',asteroidsRoute);
routes.use('/api/epic',epicRoute,);
routes.use('/api/mars/photos',marsRoute);
routes.use('/api/launches', launchesRouter)



export default routes