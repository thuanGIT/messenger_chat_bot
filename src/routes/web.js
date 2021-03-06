import express from "express";
import homepageController from "../controllers/homepageController.js";
import chatBotController from "../controllers/chatBotController.js";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.get("/webhook", chatBotController.getWebhook);
    router.post("/webhook", chatBotController.postWebhook);
    router.get("/profile", homepageController.getFacebookUserProfile);

    //Set up endpoint for collecting personal info and set up get started button & persistent menus
    router.post("/set-up-profile", homepageController.setUpUserFacebookProfile); 
    return app.use("/", router);
};

export default initWebRoutes;