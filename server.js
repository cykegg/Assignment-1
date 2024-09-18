/****************************************************************************
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Assignment: 2247 / 1
* Student Name: Ahnaf Abrar Khan
* Student Email: aakhan82@myseneca.ca
* Course/Section: WEB422/ZAA
* Deployment URL: https://assignment-1-dgiu4e552-ahnaf-khans-projects-bd989811.vercel.app
*
*****************************************************************************/

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ListingsDB = require('./modules/listingsDB.js');

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 8000;
const db = new ListingsDB();

app.use(cors());
app.use(express.json());

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

db.initialize(process.env.MONGODB_CONN_STRING)
   .then(() => {
      app.get('/', (req, res) => {
         res.json({ message: "API Listening" });
      });

      app.post('/api/listings', async (req, res) => {
         try {
            const newListing = await db.addNewListing(req.body);
            res.status(201).json(newListing);
         } catch (err) {
            res.status(500).json({ message: 'Failed to add new listing', error: err.message });
         }
      });

      app.get('/api/listings', async (req, res) => {
         const { page = 1, perPage = 10, name } = req.query;
         try {
            const listings = await db.getAllListings(Number(page), Number(perPage), name);
            res.status(200).json(listings);
         } catch (err) {
            res.status(500).json({ message: 'Failed to get listings', error: err.message });
         }
      });

      app.get('/api/listings/:id', async (req, res) => {
         try {
            const listing = await db.getListingById(req.params.id);
            if (listing) {
               res.status(200).json(listing);
            } else {
               res.status(404).json({ message: 'Listing not found' });
            }
         } catch (err) {
            res.status(500).json({ message: 'Failed to get listing', error: err.message });
         }
      });

      app.put('/api/listings/:id', async (req, res) => {
         try {
            const result = await db.updateListingById(req.body, req.params.id);
            if (result.modifiedCount > 0) {
               res.status(200).json({ message: 'Listing updated successfully' });
            } else {
               res.status(404).json({ message: 'Listing not found' });
            }
         } catch (err) {
            res.status(500).json({ message: 'Failed to update listing', error: err.message });
         }
      });

      app.delete('/api/listings/:id', async (req, res) => {
         try {
            const result = await db.deleteListingById(req.params.id);
            if (result.deletedCount > 0) {
               res.status(204).send();
            } else {
               res.status(404).json({ message: 'Listing not found' });
            }
         } catch (err) {
            res.status(500).json({ message: 'Failed to delete listing', error: err.message });
         }
      });

      app.listen(HTTP_PORT, () => {
         console.log(`Server is listening on: ${HTTP_PORT}`);
      });

   })
   .catch((err) => {
      console.log("Failed to connect to the database:", err);
   });