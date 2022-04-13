/**********************************************************
 * FILE: routes/index.js
 * 
 * DESCRIPTION: Defines application's endpoints (URIs) to 
 * handle client requests. These endpoints start from "/" 
 * in this index.js file.
**********************************************************/

const express = require('express');
const db = require('../db');
const router = express.Router();
const members = require('./members');

//Get Homepage
//queries database for all categories
//queries database for all items
router.get('/', function (req, res, next) {
  //Used to store objects from query
  const view_data = {};
  db.query('SELECT * FROM Categories').then(([category_rows])=>{
    view_data.categories = category_rows;
    return db.query('SELECT * FROM Items');
  })
      .then(([items_rows])=>{
    view_data.items = items_rows;
  })
  .then(()=>{res.render('homepage',{
    title: 'GatorTrade',
    Categories: view_data.categories,
    Items: view_data.items
  });
  });

});

/* GET aboutAll page */
router.get('/about', function (req, res, next) {
  const membersArray = Object.values(members).reduce((accum, curr) => {
    return accum.concat({
      lname: curr.lname,
      name: `${curr.fname} ${curr.lname}`,
      role: curr.role,
      img: curr.image,
    })
  }, []);
  res.render('aboutAll', { membersInfo: membersArray, title: 'Team 05 About Page'});
});

// Results page, redirected from /homepage:
router.get('/results', function (req, res, next) {
  // Targets inputted text from search bar and any selected category field.
  const { search, category } = req.query;
  let categoryId = parseInt(category);
  let totalItemCount = 0;

  // db.query('SELECT * FROM Items').then(([rows]) => {
  //   res.render('homepage', { title: 'Team 05 Home Page', Items: rows });
  // })
  //   .catch(error => {
  //     console.log(error);
  //   });
  
  // Gets total count of items in database to display on Results (/results) page.
  db.query('SELECT COUNT(*) AS length FROM Items;').then(([results]) => {
    totalItemCount = results[0].length;

    // Selected "All" for Category. No need to factor category into search.
    if (categoryId == 0) {
      db.query(`SELECT * FROM Items WHERE title LIKE '%${search}%';`).then(([results]) => {
        res.render('results', { title: 'Team 05 Results', results: results, resultsObj: JSON.stringify(results), total: totalItemCount });
      });
    }

    // Filter results based on category chosen.
    else if (categoryId > 0) {
      db.query(`SELECT * FROM Items WHERE title LIKE '%${search}%' AND category=${categoryId};`).then(([results]) => {
        res.render('results', { title: 'Team 05 Results', results: results, resultsObj: JSON.stringify(results), total: totalItemCount });
      });
    }
  }).catch(error => {
    console.log(error);
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Team 05 Login Page' });
});


router.get('/message', function (req, res, next) {
  res.render('test_message', { title: 'Team 05 Message Modal' });
});

//Renders item's detail page
router.get('/dp', function(req, res, next){
  const {id} = req.query;
  let idItems = parseInt(id);
  //Uses idItems column in Items table to filter out the row of data we want to display
  db.query("SELECT * FROM Items WHERE idItems = ?", [idItems]).then(([Item])=>{
    res.render('itemsDetailPage', {title: "Team 05 item's detail page", Item: Item});
  }).catch(error =>{
    console.log(error);
  });
});

module.exports = router;
