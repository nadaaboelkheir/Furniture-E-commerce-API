const AsyncHandler = require('express-async-handler');
const UserModel = require('../api/models/user.model');

exports.createAdminIfNotExists = AsyncHandler(async () => {
	const existingAdmin = await UserModel.findOne({ isAdmin: true });

	if (!existingAdmin) {
		const admin = new UserModel({
			email: 'admin@gmail.com',
			password: 'Admin@123',
			isAdmin: true,
		});

		await admin.save();
		console.log('Admin user created');
	} else {
		console.log('Admin user already exists');
	}
});
