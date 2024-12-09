const mongoose = require('mongoose');
const initData = require('./data.js'); // This initData variable has an object value.
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main()
  .then(() => {
    console.log('connected to DB.');
  })
  .catch(err => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async function () {
  await Listing.deleteMany({});

  initData.data = initData.data.map(obj => {
    return { ...obj, owner: '674ac004016763358a5f35b0' };
  });

  await Listing.insertMany(initData.data); // from initData object, I am accessing the data array.
  console.log('data was initialized');
};

initDB();
