require( 'dotenv' ).config();
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const path = require( 'path' );
const cors = require( 'cors' );

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );

// MongoDB connect
mongoose.connect( MONGO_URI )
  .then( () => console.log( '✅ MongoDB connected' ) )
  .catch( ( err ) =>
  {
    console.error( '❌ MongoDB connection error:', err.message );
    process.exit( 1 );
  } );

const axios = require( "axios" );

setInterval( () =>
{
  axios.get( "https://customer-data-check.onrender.com/" )
    .then( () => console.log( "Self pinged at", new Date().toLocaleString() ) )
    .catch( err => console.error( "Ping failed", err.message ) );
}, 5 * 60 * 1000 );


// Model
const userSchema = new mongoose.Schema( {
  number: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true }
}, { timestamps: true } );
const User = mongoose.model( 'User', userSchema );

// Routes


// API: Get by number
app.get( '/api/users/:number', async ( req, res ) =>
{
  try
  {
    const user = await User.findOne( { number: req.params.number } );
    if ( !user ) return res.status( 404 ).json( { ok: false, message: 'User not found' } );
    res.json( { ok: true, data: user } );
  } catch ( e )
  {
    res.status( 500 ).json( { ok: false, message: e.message } );
  }
} );

// API: Add user
app.post( '/api/users', async ( req, res ) =>
{
  try
  {
    const { number, name, email } = req.body;
    if ( !number || !name || !email )
    {
      return res.status( 400 ).json( { ok: false, message: 'number, name, email are required' } );
    }
    const exists = await User.findOne( { number } );
    if ( exists ) return res.status( 409 ).json( { ok: false, message: 'User already exists' } );
    const created = await User.create( { number, name, email } );
    res.status( 201 ).json( { ok: true, data: created } );
  } catch ( e )
  {
    res.status( 500 ).json( { ok: false, message: e.message } );
  }
} );

// API: Update by number
app.put( '/api/users/:number', async ( req, res ) =>
{
  try
  {
    const { name, email } = req.body;
    const updated = await User.findOneAndUpdate(
      { number: req.params.number },
      { $set: { name, email } },
      { new: true }
    );
    if ( !updated ) return res.status( 404 ).json( { ok: false, message: 'User not found' } );
    res.json( { ok: true, data: updated } );
  } catch ( e )
  {
    res.status( 500 ).json( { ok: false, message: e.message } );
  }
} );

// 404 fallback for API
app.use( '/api', ( req, res ) => res.status( 404 ).json( { ok: false, message: 'Not found' } ) );

// Start
app.listen( PORT, () =>
{
  console.log( `🚀 Server running: http://localhost:${PORT}` );
} );
