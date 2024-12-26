require('dotenv').config();

if (process.env.MODE === "1")
	require('./postgres')
else
	require('./mongo')