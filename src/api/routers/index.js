const userRoutes = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');
const routes = (app) => {
	app.use('/user', userRoutes);
	app.use('/dashboard', dashboardRoutes);
};

module.exports = routes;
