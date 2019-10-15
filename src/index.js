const app = require('./app');

const port = process.env.PORT || 15000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
