const Task = require("../models/task");
const User = require("../models/user");

exports.getTasks = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("task");
    res.status(200).json({ task: user.task });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addTask = async (req, res, next) => {
  const task = new Task({
    value: req.body.task,
    creator: req.userId,
  });

  try {
    await task.save();
    const user = await User.findById(req.userId);
    user.task.push(task);
    await user.save();
    res.status(201).json({
      message: "task added successfully!",
      task: task,
      creator: { _id: user._id },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  console.log(taskId);
  try {
    const task = await Task.findById(taskId);
    console.log(task);
    task.value = req.body.task;
    const result = await task.save();
    res.status(200).json({ message: "updated successfully!", task: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  try {
    await Task.findByIdAndDelete(taskId);
    const user = await User.findById(req.userId);
    user.task.pull(taskId);
    await user.save();
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
