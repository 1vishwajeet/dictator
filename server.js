import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();



const app = express();
const PORT = process.env.PORT || 4000;
const DB = process.env.DB;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---- Database Connection ----
mongoose
  .connect('mongodb+srv://vishwajeeet0994:VGoSF796LkDoMJjt@cluster0.ws863.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected'))
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit if database connection fails
  });

// ---- Schema ----
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email'],
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
  },
});

const User = mongoose.model('User', userSchema);

// ---- Input Validation Middleware ----
const validateInput = (req, res, next) => {
  const { email, details } = req.body;

  if (!email || !details) {
    return res.status(400).send({ msg: 'Email and details are required' });
  }

  if (!/.+@.+\..+/.test(email)) {
    return res.status(400).send({ msg: 'Please enter a valid email' });
  }

  next();
};

// ---- POST Endpoint ----
app.post('/', validateInput, async (req, res) => {
  const { email, details } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ msg: 'Email already exists' });
    }

    // Create a new user
    const data = await User.create({ email, details });
    res.status(201).send({ msg: 'Data Created', data });
  } catch (err) {
    console.error('Error while creating data:', err.message);
    res.status(500).send({ msg: 'Something went wrong', error: err.message });
  }
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
