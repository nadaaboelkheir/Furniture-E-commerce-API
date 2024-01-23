const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./api/routers/index');
const dbConnect = require('./config/database.config');
const { PORT, NODE_ENV } = require('./api/helpers/env');
const { createAdminIfNotExists } = require('./config/admin.config');
const responseHandler = require('./api/helpers/responseHandler');
const app = express();

app.use(morgan('dev'));
app.use(cors());

app.use(express.json());

routes(app);

//end points
app.use((req, res, next) => {
	return responseHandler(res, 404, {
		msg: 'API Not Found',
		arMsg: 'صفحة غير موجودة',
	});
});

app.use((err, req, res, next) => {
	err.status = err.status || 500;
	if (NODE_ENV?.trim() === 'PreProduction') {
		err.name = err.arName || err.name;
		err.message = err.arMessage || err.message;
	} else if (NODE_ENV?.trim() === 'production') {
		err.name = err.arName || err.name;
		err.message = err.arMessage || 'خطأ غير معروف';
	}
	res.status(err.status).json({
		status: err.status,
		errors: { error: err.toString() },
	});
});

dbConnect()
	.then(async () => {
		console.log('Connected to MongoDB');
		await createAdminIfNotExists();
		app.listen(PORT, () => console.log(`Listenning to port ${PORT}...`));
	})
	.catch((err) => console.log('Db Connection Error: ' + err));
