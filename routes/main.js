// Route handler for forum web app

module.exports = function(app, forumData) {

    // Handle our routes

    // Home page
    app.get('/',function(req,res){
        res.render('index.ejs', forumData)
    });

    // About page
    app.get('/about',function(req,res){
        res.render('about.ejs', forumData);
    });

    // View Posts page
    app.get('/viewposts',function(req,res){
        // Query to select all posts from the database
        let sqlquery = `SELECT  post_id, post_date, topic_title, post_title, post_content, username, topic_id, user_id
                        FROM vw_posts
                        ORDER BY post_date DESC`;

        // Run the query
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }

          // Pass results to the EJS page and view it
          let data = Object.assign({}, forumData, {posts:result});
          console.log(data)
          res.render('viewposts.ejs', data);
        });
    });

    // View Posts page
    app.get('/viewpostsforuser/:user',function(req,res){
        // Query to select all posts from the database
        let sqlquery = `SELECT  post_id, post_date, topic_title, post_title, post_content, username, topic_id, user_id
                        FROM vw_posts
                        WHERE user_id=?
                        ORDER BY post_date DESC`;

        // Run the query
        db.query(sqlquery, [req.params.user], (err, result) => {
          if (err) {
             res.redirect('./');
          }

          // Pass results to the EJS page and view it
          let data = Object.assign({}, forumData, {posts:result});
          console.log(data)
          res.render('viewposts.ejs', data);
        });
    });    

    // View Posts page
    app.get('/viewpostsfortopic/:topic',function(req,res){
        // Query to select all posts from the database
        let sqlquery = `SELECT  post_id, post_date, topic_title, post_title, post_content, username, topic_id, user_id
                        FROM vw_posts
                        WHERE topic_id=?
                        ORDER BY post_date DESC`;

        // Run the query
        db.query(sqlquery, [req.params.topic], (err, result) => {
          if (err) {
             res.redirect('./');
          }

          // Pass results to the EJS page and view it
          let data = Object.assign({}, forumData, {posts:result});
          console.log(data)
          res.render('viewposts.ejs', data);
        });
    });    

    // List Users page
    app.get('/users',function(req,res){
        // Query to select all users
        let sqlquery = `SELECT   user_id, username, firstname, surname, country
                        FROM     users 
                        ORDER BY username;`
                 
        // Run the query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            // Pass results to the EJS page and view it
            let data = Object.assign({}, forumData, {users:result});
            console.log(data)
            res.render('users.ejs', data);
        });                        
    });

    // List Topics page
    app.get('/topics',function(req,res){
        // Query to select all topics
        let sqlquery = `SELECT   topic_id, topic_title, topic_description
                        FROM     topics
                        ORDER BY topic_title`

        // Run the query       
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            // Pass results to the EJS page and view it
            let data = Object.assign({}, forumData, {topics:result});
            console.log(data)
            res.render('topics.ejs', data);
        });    
    });

    // Add a New Post page
    app.get('/addpost',function(req,res){
        // Set the initial values for the form
        let initialvalues = {username: '', topic: '', title: '', content: ''}

        // Pass the data to the EJS page and view it
        return renderAddNewPost(res, initialvalues, "") 
    });

    // Helper function to 
    function renderAddNewPost(res, initialvalues, errormessage) {
        let data = Object.assign({}, forumData, initialvalues, {errormessage:errormessage});
        console.log(data)
        res.render("addpost.ejs", data);
        return 
    }

    // Add a New Post page form handler
    app.post('/postadded', function (req,res) {
        let params = [req.body.title, req.body.content, req.body.topic, req.body.username]
        let sqlquery = `CALL sp_insert_post(?,?,?,?)`
        db.query(sqlquery, params, (err, result) => {
            if (err) {
                return renderAddNewPost(res, req.body, err.message)
            }
            res.send('You post has been added to forum');
         });    
    });

    // Search for Posts page
    app.get('/search',function(req,res){
        res.render("search.ejs", forumData);
    });

    // Search for Posts form handler
    app.get('/search-result', function (req, res) {
        //searching in the database
        let term = '%' + req.query.keyword + '%'
        let sqlquery = `SELECT post_id, post_date, topic_title, post_title, post_content, username, topic_id, user_id 
                        FROM   vw_posts
                        WHERE  post_title LIKE ? OR post_content LIKE ?
                        ORDER BY post_date DESC`

        db.query(sqlquery, [term, term], (err, result) => {
            if (err) {
                res.redirect('./');
            }

            let data = Object.assign({}, forumData, {posts:result});
		    res.render('viewposts.ejs', data);
        });      
    });

    // User page
    app.get('/user/:user',function(req,res){
        console.log(req.params)

        let userquery = `SELECT u.username, u.firstname, u.surname, u.country
                        FROM users u
                        WHERE user_id=?`;
        let topicsquery = `SELECT topic_id, topic_title, topic_description
                           FROM vw_membership
                           WHERE user_id=?`

        db.query(userquery, [req.params.user], (err, result) => {
            if (err) {
                res.redirect('./');
            }

            // Add user info returned from the query to data object
            let data = Object.assign({}, forumData, {user:result[0]});

            db.query(topicsquery, [req.params.user], (err, result) => {
                if (err) {
                    res.redirect('./');
                }          
                
                // Add topics info returned from the query to data object
                data = Object.assign({}, data, {topics:result});

                // Now render the page, passing in the data object
                res.render('user.ejs', data);
            }); 
        });      
    });    

    // Topic page
    app.get('/topic/:topic',function(req,res){
        console.log(req.params)

        let topicquery = `SELECT topic_title, topic_description 
                          FROM topics
                          WHERE topic_id=?`;
        let usersquery = `SELECT username, firstname, surname, country
                           FROM vw_membership
                           WHERE topic_id=?`

        db.query(topicquery, [req.params.topic], (err, result) => {
            if (err) {
                res.redirect('./');
            }

            // Add topic info returned from the query to data object
            let data = Object.assign({}, forumData, {topic:result[0]});

            db.query(usersquery, [req.params.topic], (err, result) => {
                if (err) {
                    res.redirect('./');
                }          
                
                // Add users info returned from the query to data object
                data = Object.assign({}, data, {users:result});

                // Now render the page, passing in the data object
                res.render('topic.ejs', data);
            }); 
        });      
    });        

    // Delete page
    app.get('/delete/:post',function(req,res){
        console.log(req.params)

        let sql = `DELETE FROM posts
                          WHERE post_id=?`;

        db.query(sql, [req.params.post], (err, result) => {
            if (err) {
                res.redirect('./');
            }

            res.send('Post deleted');
        });      
    });      

    // View single post
    app.get('/post/:post', function (req, res) {
        let sqlquery = `SELECT post_id, post_date, topic_title, post_title, post_content, username, topic_id, user_id 
                        FROM   vw_posts
                        WHERE  post_id=?`

        db.query(sqlquery, [req.params.post], (err, result) => {
            if (err) {
                res.redirect('./');
            }

            let data = Object.assign({}, forumData, {post:result[0]});
		    res.render('post.ejs', data);
        });      
    });    
}
