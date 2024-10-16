import express from "express";
import bodyparser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";

const _dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Array to store blog posts
let posts = [];

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

// Set up sessions
app.use(session({
    secret: 'your-secret-key',   // Replace with a strong key
    resave: false,
    saveUninitialized: true
}));

// Home route
app.get("/", (req, res) => {
    res.render("index.ejs", { posts }); // Pass the posts array to the index.ejs
});

// Create post form route
app.get("/create", (req, res) => {
    if (!req.session.isLoggedIn) {
        // If not logged in, show an alert and redirect to login
        res.send(`
            <script>
                alert("You need to log in to create a post!");
                window.location.href = "/login";
            </script>
        `);
    } else {
        res.sendFile(_dirname + "/public/create.html");
    }
});

// Handle post creation
app.post("/create-post", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }
    
    const { title, content, date, about, image  } = req.body;
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1; // Ensure ID is a number
    const newPost = { title, content, date, about, image , id };

    // post mai push liya new post 
    posts.push(newPost);

    // Redirect to home to display the post
    res.redirect("/");
});

// Display login page
app.get("/login", (req, res) => {
    res.sendFile(_dirname + "/public/login.html");
});

// Handle login form submission
app.post("/submit", (req, res) => {
    const { username , email } = req.body;

    // Validate credentials (in real app, check with a database)
    if (username && email) {
        req.session.isLoggedIn = true; // Set session as logged in
        req.session.user = { email };   // Store user email in session (you can also store user ID)

        console.log("User logged in:", email);
        res.redirect("/");  // Redirect to home page after successful login
    } else {
        res.send("Invalid login details");
    }
});

app.get("/me", (req, res) => {
    if (!req.session.isLoggedIn) {
        // If not logged in, show an alert and redirect to login
        res.send(`
            <script>
                alert("You need to log in to create a post!");
                window.location.href = "/login";
            </script>
        `);
    } else {
        res.render("me.ejs", {posts});
    }

});

// Handle post deletion
app.post("/delete-post/:id", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }

    const postId = parseInt(req.params.id); // Get the post ID from the URL parameter

    console.log("Attempting to delete post with ID:", postId); // Debug log

    // Log current posts before deletion
    console.log("Current posts before deletion:", posts);

    // Filter out the post with the matching id
    posts = posts.filter(post => post.id !== postId);

    // Log remaining posts after deletion
    console.log("Remaining posts after deletion:", posts);

    res.redirect("/"); // Redirect back to the homepage
});



app.get("/edit/:id", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }

    const postId =  parseInt(req.params.id) ;      // very imp !!!!!!
    const postToEdit = posts.find(post => post.id === postId);

    if (!postToEdit) {
        return res.status(404).send("Post not found");
    }

    res.render("edit.ejs", { post: postToEdit }); // Render the edit form
});

// Handle post update
app.post("/edit/:id", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }

    const postId = parseInt(req.params.id);
    const updatedPost = req.body;
     console.log(updatedPost);
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
        posts[postIndex] = { id: postId, ...updatedPost }; // ...updatedPost syntax spreads the contents of updatedPost into the object, effectively replacing the old values with the new ones.
    } // also keeps the id the same by explicitly setting id: postId before spreading the updatedPost. This ensures that the post's ID remains unchanged.

    res.redirect("/"); // Redirect back to the homepage
});


// Start the server
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
