const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const taskController = require("../controller/task");

router.get("/task", isAuth, taskController.getTasks);

router.post("/addtask", isAuth, taskController.addTask);

router.put("/task/:taskId", isAuth, taskController.updateTask);

router.delete("/task/:taskId", isAuth, taskController.deleteTask);

module.exports = router;
