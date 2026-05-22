const { Plan } = require("../../models");

exports.createPlan = async (req,res,next) => {
  try {

    const plan = await Plan.create(req.body);
    res.status(201).json({
      success: true,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlans = async (req,res,next) => {
  try {
    const plans = await Plan.findAll();

    res.json({
      success: true,
      count: plans.length,
      plans,
    });

  } catch (error) {
    next(error);
  }
};