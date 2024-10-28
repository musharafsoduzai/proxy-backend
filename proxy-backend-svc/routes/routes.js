// routes.js
import express from "express";
import userAuthController from "../controller/userApi.js";
import roleController from "../controller/roleApi.js";
import categoryController from "../controller/categoryApi.js";
import locationController from "../controller/locationApi.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

//.......................users routes............................//

router.post("/users/login", userAuthController?.login);
router.post("/users", userAuthController?.register);


//.......................roles routes............................//

router.post("/roles", authenticateToken, roleController.addRole);
router.get("/roles", authenticateToken, roleController.getAllRoles);
router.get("/roles/:id", authenticateToken, roleController.getOneRole);
router.put("/roles/:id", authenticateToken, roleController.updateRole);
router.delete("/roles/:id", authenticateToken, roleController.deleteRole);

//.......................category routes............................//

router.post("/categories", authenticateToken, categoryController.addCategory);
router.get("/categories", authenticateToken, categoryController.getAllCategories);
router.get("/categories/:id", authenticateToken, categoryController.getOneCategory);
router.put("/categories/:id", authenticateToken, categoryController.updateCategory);
router.delete("/categories/:id", authenticateToken, categoryController.deleteCategory);

//.......................locations routes............................//

router.post("/locations", authenticateToken, locationController.addLocation);
router.get("/locations", authenticateToken, locationController.getAllLocation);
router.get("/locations/:id", authenticateToken, locationController.getOneLoction);
router.put("/locations/:id", authenticateToken, locationController.updateLocation);
router.delete("/locations/:id", authenticateToken, locationController.deleteLocation);

export default router;
